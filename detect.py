#!/usr/bin/env python3
"""Cineplex showtime detector — Phase 0 spike.

Polls the public Cineplex APIM showtimes endpoint (same call the website's JS
makes) and reports showtimes for target movies at a target theatre. No browser,
no login, no dependencies — detection is just an authenticated GET.

Booking still needs a real logged-in session (Phase 2); detection does not.
"""
import json
import sys
import time
import urllib.parse
import urllib.request

API = "https://apis.cineplex.com/prod/cpx/theatrical/api/v1"
# ponytail: public key lifted from the site's JS bundle; rarely rotates.
# If a call starts returning 401, re-scrape it from https://www.cineplex.com _next JS.
KEY = "dcdac5601d864addbc2675a2e96cb1f8"
HEADERS = {
    "Ocp-Apim-Subscription-Key": KEY,
    "Referer": "https://www.cineplex.com/",
    "User-Agent": "Mozilla/5.0",
}


def _get(path, **params):
    """GET + parse JSON. Retries once if the body comes back empty or non-JSON
    (Incapsula occasionally serves a challenge/blank under load). Returns None if
    both tries fail — callers treat that as 'no data this poll'."""
    url = f"{API}/{path}?" + urllib.parse.urlencode({"language": "en", **params})
    for attempt in range(2):
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=20) as r:
            raw = r.read()
        try:
            if raw.strip():
                return json.loads(raw)
        except ValueError:
            pass
        time.sleep(1)
    return None


def theatres():
    """[(theatreId, name, slug)] near the request IP."""
    d = _get("theatres")
    out = []
    for group in ("favouriteTheatres", "nearbyTheatres"):
        for t in d.get(group, []):
            out.append((t["theatreId"], t["theatreName"], t["theatreUrl"]))
    return out


def find_showtimes(theatre_id, date, want_movies):
    """Return [{movie, experience, date}] for movies whose name/slug matches
    any string in want_movies (case-insensitive substring). want_movies=None → all."""
    data = _get("showtimes", LocationId=theatre_id, Date=date)
    hits = []
    for theatre in data:
        for day in theatre.get("dates", []):
            for m in day.get("movies", []):
                name, slug = m.get("name", ""), m.get("filmUrl", "")
                if want_movies is None or any(
                    w.lower() in name.lower() or w.lower() in slug.lower()
                    for w in want_movies
                ):
                    hits.append({
                        "movie": name,
                        "experience": m.get("experienceType", []),
                        "date": day.get("startDate"),
                        "filmId": m.get("id"),
                    })
    return hits


def find_sessions(theatre_id, want_movies):
    """Bookable sessions matching want_movies across ALL upcoming dates.

    One API call per theatre (LocationId with no Date returns the full schedule).
    Returns [{showtimeId, movie, experience, ticketingUrl, date}] — showtimeId is
    the stable key the watcher dedupes on; date (YYYY-MM-DD) is what booking needs.
    """
    import re
    data = _get("showtimes", LocationId=theatre_id)
    out = []
    for theatre in (data or []):
        tname = theatre.get("theatre", "")
        for day in theatre.get("dates", []):
            date = (day.get("startDate") or "")[:10]
            for m in day.get("movies", []):
                name, slug = m.get("name", ""), m.get("filmUrl", "")
                if want_movies is not None and not any(
                    w.lower() in name.lower() or w.lower() in slug.lower() for w in want_movies):
                    continue
                for exp in m.get("experiences", []):
                    for s in exp.get("sessions", []):
                        mm = re.search(r"showtimeId=(\d+)", s.get("seatMapUrl", "") or "")
                        if mm:
                            sid, area = mm.group(1), s.get("areaCode", "")
                            # www.cineplex.com universal link — taps open the iOS app
                            # (falls back to Safari if the app isn't installed).
                            deeplink = (f"https://www.cineplex.com/Movie/{slug}?deepLinkToSession=true"
                                        f"&filmSlug={slug}&VistaSessionId={sid}"
                                        f"&VistaHOCategoryCode={area}&LocationId={theatre_id}"
                                        f"&IsSeriesShowtime=False")
                            out.append({"showtimeId": sid, "movie": name, "theatre": tname,
                                        "experience": exp.get("experienceTypes"),
                                        "deeplink": deeplink, "date": date,
                                        "time": (s.get("showStartDateTime") or "")[11:16]})
    return out


def _selfcheck():
    """Offline: filter logic works on a fixture without hitting the network."""
    fixture = [{"dates": [{"startDate": "2026-07-24T00:00:00", "movies": [
        {"id": 1, "name": "The Odyssey", "filmUrl": "the-odyssey", "experienceType": ["IMAX"]},
        {"id": 2, "name": "Some Other Film", "filmUrl": "other", "experienceType": []},
    ]}]}]
    import unittest.mock as mock
    with mock.patch(f"{__name__}._get", return_value=fixture):
        assert len(find_showtimes(0, "2026-07-24", ["odyssey"])) == 1
        assert len(find_showtimes(0, "2026-07-24", ["nope"])) == 0
        assert len(find_showtimes(0, "2026-07-24", None)) == 2
    print("selfcheck ok")


if __name__ == "__main__":
    if sys.argv[1:2] == ["--selfcheck"]:
        _selfcheck()
    elif sys.argv[1:2] == ["--theatres"]:
        for tid, name, slug in theatres():
            print(f"{tid}\t{name}\t{slug}")
    elif sys.argv[1:2] == ["--sessions"]:
        # detect.py --sessions <theatreId> [movie-substring]
        tid = int(sys.argv[2])
        movies = [sys.argv[3]] if len(sys.argv) > 3 else None
        for s in find_sessions(tid, movies):
            print(f"{s['showtimeId']:>8}  {s['date']} {s['time']}  {s['movie'][:35]:35} {','.join(s['experience'] or []) or '-'}")
    else:
        # demo: everything showing at Junxion Erin Mills (7313) on a date
        tid = int(sys.argv[1]) if len(sys.argv) > 1 else 7313
        date = sys.argv[2] if len(sys.argv) > 2 else "2026-07-24"
        for h in find_showtimes(tid, date, None):
            print(f"{h['movie']:40} {','.join(h['experience']) or '-'}")
