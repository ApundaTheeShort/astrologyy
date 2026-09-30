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

## Deploy to Vercel

The repository includes `vercel.json` and `api/index.py` for Vercel's Python
runtime. Configure these Vercel environment variables before deploying:

- `DJANGO_SECRET_KEY`: a long random production secret.
- `DJANGO_DEBUG`: `False`.
- `DJANGO_ALLOWED_HOSTS`: your Vercel hostname, such as `my-project.vercel.app`.
- `CSRF_TRUSTED_ORIGINS`: the full HTTPS origin, such as
  `https://my-project.vercel.app`.

Vercel installs the packages in `requirements.txt` automatically. The
`/verdict-audio/` endpoint uses gTTS and therefore needs outbound network
access at runtime.