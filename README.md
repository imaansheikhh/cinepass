# cinepass

A stdlib-only Python 3 watcher that polls Cineplex’s public showtimes API and
sends an ntfy.sh push the first time a new movie appears at a watched theatre.
Tapping a notification opens the earliest showtime in the Cineplex app.
No dependencies, no pip, no login, and no booking automation.

## Unofficial, personal use

This is an unofficial project for personal use, unaffiliated with Cineplex.
It uses the public subscription key shipped in Cineplex’s website JavaScript;
that key is intentionally included in `detect.py` and is not a private secret.
Cineplex could object to automated polling under its terms of use. Review its
terms and respect its access restrictions.

## Setup

1. Install Python 3 and clone this repository.
2. Generate a private topic next to the code:

   ```sh
   python3 -c "import secrets; print('cinepass-' + secrets.token_urlsafe(24))" > topic.txt
   chmod 600 topic.txt
   ```

3. Subscribe to that topic in the ntfy app. The topic is the only access control:
   anyone who knows it can read and send notifications. Never commit or share it.
4. Edit `watch.json` to choose theatre IDs and polling intervals. The supplied
   targets are examples; use `python3 detect.py --theatres` to find theatre IDs.
5. Run:

   ```sh
   python3 notify.py --test-push
   python3 watcher.py
   ```

Importing the modules and running selfchecks works without `topic.txt`.
Sending a push requires a nonempty topic file.

## Behavior and configuration

The first run silently records the existing movies in `known_movies.json`.
Later polls send one notification per new movie at each theatre. State survives
restarts. Movies added while the watcher was offline alert on the next poll.

`watch.json` sets `poll_min_seconds` and `poll_max_seconds` (defaults: 120–420).
Each target has a `theatre_id` and may include a `movies` list for case-insensitive
substring filtering; omit it to watch all titles.

## Verification

Every module has an offline selfcheck:

```sh
python3 detect.py --selfcheck && python3 notify.py --selfcheck && python3 watcher.py --selfcheck
```

## Deployment

See [DEPLOY.md](DEPLOY.md) for setup on your own GCP VM. Replace `YOUR_PROJECT_ID`,
`YOUR_VM_NAME`, and `YOUR_ZONE` with your own values. Code and the private
`topic.txt` belong in `/opt/cinepass/`; the systemd unit is `cinepass.service`.
No existing deployment is provided by this repository.

## Limitations

- Titles are matched as strings; title edits can trigger another notification.
- Known movie keys are never removed, so returning movies do not alert again.
- An empty or challenged API response can look like no new showtimes.
- Failed pushes are logged but marked known and never retried.
- ntfy service quotas and Cineplex’s published schedule limit notification coverage.

## Files

| File | Role |
| --- | --- |
| `detect.py` | Public Cineplex API client |
| `notify.py` | ntfy push; reads private configuration from `topic.txt` |
| `watcher.py` | Polling, deduplication, and notifications |
| `watch.json` | Theatre IDs and polling interval |
| `cinepass.service` | systemd unit |
| `topic.txt` | Private ntfy topic, gitignored |
| `known_movies.json` | Runtime state, gitignored |
| `DEPLOY.md` | Deployment instructions |

Licensed under the [MIT License](LICENSE).
