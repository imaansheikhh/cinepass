#!/usr/bin/env python3
"""One-way ntfy.sh push. Tapping the notification opens `click` (the Cineplex
app deep link). Install the ntfy app and subscribe to TOPIC. The topic name is
the only access control — use a long random string.
"""
import urllib.request
from pathlib import Path

# The topic is the only access control; never commit topic.txt.
_topic_file = Path(__file__).with_name("topic.txt")
TOPIC = _topic_file.read_text().strip() if _topic_file.exists() else None


def _build_push(topic, title, click):
    headers = {"Title": title, "Priority": "urgent", "Tags": "clapper"}
    if click:
        headers["Click"] = click  # URL opened when the notification is tapped
    return f"https://ntfy.sh/{topic}", headers


def push_alert(title, message, click=None, topic=TOPIC):
    if not topic:
        raise ValueError("Put a long random ntfy topic in topic.txt before sending notifications")
    url, headers = _build_push(topic, title, click)
    req = urllib.request.Request(url, data=message.encode(), headers=headers, method="POST")
    with urllib.request.urlopen(req, timeout=15) as r:
        return r.status


def _selfcheck():
    url, headers = _build_push("A", "t", "https://x.test/app")
    assert url == "https://ntfy.sh/A" and headers["Title"] == "t"
    assert headers["Click"] == "https://x.test/app"
    for v in headers.values():  # ntfy headers must be latin-1 (no emoji)
        v.encode("latin-1")
    print("selfcheck ok")


if __name__ == "__main__":
    import sys
    if sys.argv[1:2] == ["--selfcheck"]:
        _selfcheck()
    elif sys.argv[1:2] == ["--test-push"]:
        print(push_alert("cinepass test", "if you see this, ntfy works"))
