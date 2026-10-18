# Deploy cinepass to a GCP VM

Requires Python 3 only, with no pip or virtual environment. Replace
`YOUR_PROJECT_ID`, `YOUR_VM_NAME`, and `YOUR_ZONE` throughout these commands.
Choose a machine and region appropriate to your budget; check current GCP
pricing and free-tier eligibility before creating resources.

## Prepare locally

Install and authenticate the Google Cloud CLI, then select your project:

```sh
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

Put a long random topic in the gitignored `topic.txt` next to the code:

```sh
python3 -c "import secrets; print('cinepass-' + secrets.token_urlsafe(24))" > topic.txt
chmod 600 topic.txt
```

Subscribe to that topic in the ntfy app and configure targets in `watch.json`.
Anyone who knows the topic can read and send notifications; keep it private.

## Create a VM and upload

```sh
gcloud compute instances create YOUR_VM_NAME \
  --zone=YOUR_ZONE \
  --machine-type=e2-micro \
  --image-family=debian-12 --image-project=debian-cloud \
  --boot-disk-size=10GB

gcloud compute scp detect.py notify.py watcher.py watch.json topic.txt cinepass.service \
  YOUR_VM_NAME:~ --zone=YOUR_ZONE
gcloud compute ssh YOUR_VM_NAME --zone=YOUR_ZONE
```

## Install on the VM

Copy `topic.txt` to `/opt/cinepass/` along with the Python files:

```sh
sudo mkdir -p /opt/cinepass
sudo mv detect.py notify.py watcher.py watch.json topic.txt /opt/cinepass/
sudo chmod 600 /opt/cinepass/topic.txt
sudo mv cinepass.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now cinepass
systemctl status cinepass
sudo journalctl -u cinepass -f
```

The first run baselines silently and writes `/opt/cinepass/known_movies.json`.
The service restarts automatically and starts on boot. It sets
`PYTHONUNBUFFERED=1` so logs appear immediately.

## Check notifications and update configuration

On the VM, send a test notification with:

```sh
sudo python3 /opt/cinepass/notify.py --test-push
```

To update targets, upload `watch.json` locally:

```sh
gcloud compute scp watch.json YOUR_VM_NAME:~ --zone=YOUR_ZONE
gcloud compute ssh YOUR_VM_NAME --zone=YOUR_ZONE \
  --command="sudo mv ~/watch.json /opt/cinepass/ && sudo systemctl restart cinepass"
```

To change the topic, update your local private `topic.txt`, copy it to the VM,
move it into `/opt/cinepass/`, restore mode 600, and restart `cinepass`.
Restarting preserves the baseline. To rebaseline deliberately, stop the service,
remove `/opt/cinepass/known_movies.json`, then start it again.

## API availability

Cloud IPs may be blocked by Cineplex’s access controls. Check logs for poll
errors; some empty responses can silently appear as no showtimes. If access is
blocked, stop polling and respect the restriction. See the unofficial,
personal-use disclaimer in README.md.
