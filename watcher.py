#!/usr/bin/env python3
"""Notify when a movie's showtimes appear at a watched theatre.

Edit watch.json. Runs forever (pure HTTP, no browser). On a movie's first
appearance at a target theatre it sends ONE ntfy push; tapping it opens that
showtime in the Cineplex app.

  * A target with a "movies" list watches those titles. A target WITHOUT
    "movies" (or movies: null) alerts on ANY movie newly added at that theatre.
  * One alert per (theatre, movie) — the whole showtime batch = one ping.
  * State is persisted to known_movies.json, so restarts/sleep don't re-baseline:
    the very first run ever baselines what's already listed silently; after that,
    any movie not already in the file alerts (including ones added while it was off).
  * Poll interval is randomized each tick (poll_min_seconds..poll_max_seconds)
    so it doesn't look like a bot on a fixed clock.

Run:  python3 watcher.py   (Mac laptop: caffeinate -i python3 watcher.py)
"""
import json
import random
import time
from pathlib import Path

import detect
import notify

HERE = Path(__file__).parent
CONFIG = json.loads((HERE / "watch.json").read_text())
POLL_MIN = CONFIG.get("poll_min_seconds", 120)
POLL_MAX = CONFIG.get("poll_max_seconds", 420)
STATE = HERE / "known_movies.json"


def load_known():
    """Set of 'theatreId:movie' keys, or None if we've never run (first baseline)."""
    if STATE.exists():
        return set(json.loads(STATE.read_text()))
    return None


def save_known(known):
    STATE.write_text(json.dumps(sorted(known)))


def poll(known, warm, push=notify.push_alert):
    """One pass over all targets. Mutates `known`; alerts (via push) for movies
    not yet known, unless warm (first-ever baseline). Returns alert count."""
    alerts = 0
    for t in CONFIG["targets"]:
        tid = t["theatre_id"]
        try:
            sessions = detect.find_sessions(tid, t.get("movies"))  # None = any movie
        except Exception as e:
            print("poll error:", e); continue

        movies = {}
        for s in sessions:
            movies.setdefault(s["movie"], []).append(s)
        for movie, ss in movies.items():
            key = f"{tid}:{movie}"
            if key in known:
                continue
            known.add(key)
            if warm:
                continue  # baseline, don't alert
            ss.sort(key=lambda x: (x["date"], x["time"]))
            first = ss[0]
            print(f"ALERT: {movie} on sale at {first['theatre']} ({len(ss)} showtimes)")
            try:
                push(f"{movie} available at {first['theatre']}",
                     f"{len(ss)} showtimes, first {first['date']} {first['time']}",
                     click=first["deeplink"])
                alerts += 1
            except Exception as e:
                # already marked known above: a push failure must not retry forever
                # and block every other theatre/movie behind it in this loop.
                print(f"push error for {movie}: {e}")
    return alerts


def main():
    loaded = load_known()
    warm = loaded is None          # first run ever -> baseline silently
    known = loaded or set()
    print(f"watching {len(CONFIG['targets'])} target(s) every {POLL_MIN}-{POLL_MAX}s random"
          + (" (first run: baselining)" if warm else f" ({len(known)} movies known)"))
    while True:
        poll(known, warm)
        save_known(known)
        if warm:
            warm = False
            print(f"baseline set ({len(known)} movies); now watching for new ones")
        wait = random.uniform(POLL_MIN, POLL_MAX)
        print(f"next poll in {wait/60:.1f} min")
        time.sleep(wait)


def _selfcheck():
    import detect as d
    calls = []
    sessions = [{"movie": "A", "theatre": "T", "date": "2026-08-01", "time": "19:00",
                 "deeplink": "x", "showtimeId": "1"}]
    d.find_sessions = lambda tid, movies: sessions
    orig_targets = CONFIG["targets"]
    CONFIG["targets"] = [{"theatre_id": 7313}]
    known = set()
    # first run: warm baseline -> no alert, but A becomes known
    assert poll(known, warm=True, push=lambda *a, **k: calls.append(a)) == 0
    assert "7313:A" in known and not calls
    # restart: A already known -> still no alert
    assert poll(known, warm=False, push=lambda *a, **k: calls.append(a)) == 0
    # movie B appears -> exactly one alert
    sessions.append({"movie": "B", "theatre": "T", "date": "2026-08-02", "time": "20:00",
                     "deeplink": "y", "showtimeId": "2"})
    assert poll(known, warm=False, push=lambda *a, **k: calls.append(a)) == 1
    assert len(calls) == 1 and "B" in calls[0][0]
    # movies C and D appear but push is down (e.g. ntfy 429): must not crash,
    # both still get marked known (no infinite retry loop), and D isn't blocked by C's failure
    sessions.append({"movie": "C", "theatre": "T", "date": "2026-08-03", "time": "21:00",
                     "deeplink": "z", "showtimeId": "3"})
    sessions.append({"movie": "D", "theatre": "T", "date": "2026-08-04", "time": "22:00",
                     "deeplink": "w", "showtimeId": "4"})
    def flaky_push(*a, **k):
        raise Exception("429")
    assert poll(known, warm=False, push=flaky_push) == 0
    assert "7313:C" in known and "7313:D" in known
    CONFIG["targets"] = orig_targets
    print("selfcheck ok")


if __name__ == "__main__":
    import sys
    if sys.argv[1:2] == ["--selfcheck"]:
        _selfcheck()
    else:
        main()
