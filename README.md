# Gay Society

A playful Django prank website that turns any name into an official “gay”
verdict with rainbow Pride styling. The browser reads the verdict aloud with the Web Speech API,
and the certificate endpoint returns a downloadable PDF generated on the server. The verdict
also has a server-generated MP3 fallback using gTTS.

## Run locally

```bash
.venv/bin/python manage.py runserver
```

Open `http://127.0.0.1:8000/`, enter a name, and reveal the verdict.