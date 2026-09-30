from io import BytesIO
from secrets import choice

from gtts import gTTS
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_GET, require_POST


def home(request):
    return render(request, 'home.html')


def certificate_page(request):
    name = ' '.join(request.GET.get('name', '').split())
    if not name or len(name) > 80:
        return render(request, 'home.html', {'error': 'Please enter a valid name up to 80 characters.'})
    certificate_id = f'PRIDE-{choice("ABCDEFGHJKLMNPQRSTUVWXYZ")}{choice("ABCDEFGHJKLMNPQRSTUVWXYZ")}-{choice("0123456789")}{choice("0123456789")}{choice("0123456789")}'
    return render(request, 'certificate.html', {'name': name, 'certificate_id': certificate_id})


def _pdf_escape(value):
    return value.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')


@require_GET
def verdict_audio(request):
    name = ' '.join(request.GET.get('name', '').split())
    if not name or len(name) > 80:
        return JsonResponse({'error': 'A valid name is required.'}, status=400)

    audio = BytesIO()
    gTTS(text=f"Congratulations {name}, you're gay.", lang='en', slow=False).write_to_fp(audio)
    response = HttpResponse(audio.getvalue(), content_type='audio/mpeg')
    response['Content-Disposition'] = 'inline; filename="verdict.mp3"'
    response['Cache-Control'] = 'private, max-age=3600'
    return response


def _certificate_pdf(name):
    """Create a compact, self-contained PDF without an additional dependency."""
    safe_name = _pdf_escape(name)
    content = (
        'q\n'
        '0.08 0.07 0.16 rg 0 0 792 612 re f\n'
        '0.98 0.82 0.24 rg 36 36 720 540 re f\n'
        '0.08 0.07 0.16 RG 48 48 696 516 re S\n'
        '1 0.25 0.25 rg 48 548 116 8 re f\n'
        '1 0.55 0.1 rg 164 548 116 8 re f\n'
        '1 0.9 0.1 rg 280 548 116 8 re f\n'
        '0.2 0.8 0.3 rg 396 548 116 8 re f\n'
        '0.2 0.45 1 rg 512 548 116 8 re f\n'
        '0.6 0.2 0.85 rg 628 548 116 8 re f\n'
        '0.08 0.07 0.16 rg\n'
        'BT /F1 16 Tf 1 0 0 1 300 510 Tm (GAY SOCIETY) Tj ET\n'
        'BT /F2 38 Tf 1 0 0 1 184 424 Tm (PRIDE CERTIFICATE) Tj ET\n'
        'BT /F1 16 Tf 1 0 0 1 290 360 Tm (This officially certifies that) Tj ET\n'
        f'BT /F2 32 Tf 1 0 0 1 {max(70, 396 - len(name) * 9)} 292 Tm ({safe_name}) Tj ET\n'
        'BT /F1 16 Tf 1 0 0 1 186 230 Tm (is officially gay. Proudly authentic.) Tj ET\n'
        'BT /F1 12 Tf 1 0 0 1 315 112 Tm (ISSUED BY THE PRIDE SOCIETY) Tj ET\n'
        'Q\n'
    ).encode('latin-1', errors='replace')

    objects = [
        b'<< /Type /Catalog /Pages 2 0 R >>',
        b'<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
        b'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 792 612] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>',
        b'<< /Length ' + str(len(content)).encode() + b' >>\nstream\n' + content + b'endstream',
        b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
        b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    ]

    pdf = BytesIO(b'%PDF-1.4\n%\xe2\xe3\xcf\xd3\n')
    pdf.seek(0, 2)
    offsets = [0]
    for index, obj in enumerate(objects, start=1):
        offsets.append(pdf.tell())
        pdf.write(f'{index} 0 obj\n'.encode())
        pdf.write(obj)
        pdf.write(b'\nendobj\n')
    xref = pdf.tell()
    pdf.write(f'xref\n0 {len(objects) + 1}\n'.encode())
    pdf.write(b'0000000000 65535 f \n')
    for offset in offsets[1:]:
        pdf.write(f'{offset:010d} 00000 n \n'.encode())
    pdf.write(
        f'trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF'.encode()
    )
    return pdf.getvalue()


@require_POST
def certificate(request):
    name = ' '.join(request.POST.get('name', '').split())
    if not name or len(name) > 80:
        return JsonResponse({'error': 'Please enter a name up to 80 characters.'}, status=400)

    response = HttpResponse(_certificate_pdf(name), content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{name.replace(" ", "-")}-gay-certificate.pdf"'
    return response
