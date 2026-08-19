#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
YKS Defterim — uygulama başlatıcı

Bu dosya pythonw.exe ile çalıştırılır (imzalı bir program olduğu için
Akıllı Uygulama Denetimi engellemez). Yaptığı iş:

  1. Bulunduğu klasörü yerel bir sunucu olarak yayınlar (yalnız bu
     bilgisayara açık, dışarıdan erişilemez)
  2. Tarayıcıyı "uygulama kipinde" açar — adres çubuğu, sekme yok
  3. Pencere kapanınca sunucuyu da kapatır
"""

import os
import sys
import socket
import subprocess
import threading
import time
import http.server
import socketserver
import urllib.parse

PORT = 8777          # SABİT: değişirse tarayıcı burayı başka bir site
                     # sayar ve kayıtların görünmez olur
KLASOR = os.path.dirname(os.path.abspath(__file__))

TARAYICILAR = [
    r"%ProgramFiles%\Google\Chrome\Application\chrome.exe",
    r"%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe",
    r"%LocalAppData%\Google\Chrome\Application\chrome.exe",
    r"%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe",
    r"%ProgramFiles%\Microsoft\Edge\Application\msedge.exe",
    r"%ProgramFiles%\BraveSoftware\Brave-Browser\Application\brave.exe",
    r"%LocalAppData%\BraveSoftware\Brave-Browser\Application\brave.exe",
]


def port_bos_mu(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.3)
        return s.connect_ex(("127.0.0.1", port)) != 0


def bizim_sunucumuz_mu(port):
    """O portta zaten bizim uygulamamız mı duruyor?"""
    try:
        import urllib.request
        r = urllib.request.urlopen("http://127.0.0.1:%d/" % port, timeout=1)
        if r.status != 200:
            return False
        bas = r.read(4000).decode("utf-8", "ignore")
        return "YKS" in bas and "<html" in bas.lower()
    except Exception:
        return False


def port_bul():
    """
    Her zaman aynı portu kullanmaya çalış. Kayıtlar adrese bağlı
    saklandığı için port değişirse uygulama BOŞ açılır.
    """
    if port_bos_mu(PORT):
        return PORT, True             # biz kuracağız
    if bizim_sunucumuz_mu(PORT):
        return PORT, False            # zaten çalışıyor, ona bağlan
    # Başka porta geçmek tarayıcı depolama adresini değiştirir ve eski
    # kayıtları görünmez yapar. Veri güvenliği için sessizce geçme.
    return None, False


def uyari(metin):
    try:
        import ctypes
        ctypes.windll.user32.MessageBoxW(0, metin, "YKS Defterim", 0x10)
    except Exception:
        pass


class Sessiz(http.server.SimpleHTTPRequestHandler):
    """Konsola günlük yazmaz; pythonw'da konsol zaten yok."""

    def log_message(self, *args):
        pass

    def do_GET(self):
        u = urllib.parse.urlparse(self.path)
        if u.path == "/__open_brave":
            q = urllib.parse.parse_qs(u.query)
            brave = brave_bul()
            if not brave:
                self.send_error(503, "Brave bulunamadi")
                return
            if q.get("dry", [""])[0] == "1":
                data = b"BRAVE_OK"
                self.send_response(200); self.send_header("Content-Length", str(len(data)))
                self.end_headers(); self.wfile.write(data)
                return
            hedef = q.get("url", [""])[0]
            p = urllib.parse.urlparse(hedef)
            izinli = {"youtube.com", "www.youtube.com", "m.youtube.com",
                      "music.youtube.com", "youtu.be", "www.youtu.be"}
            if p.scheme not in ("http", "https") or p.hostname not in izinli:
                self.send_error(400, "Gecersiz adres")
                return
            subprocess.Popen([brave, hedef])
            self.send_response(204); self.end_headers()
            return
        super().do_GET()

    def handle_one_request(self):
        # Tarayıcı sekmeyi kapatınca bağlantı yarıda kopar; bu normaldir
        # ve hata sayılmaz.
        try:
            super().handle_one_request()
        except (ConnectionResetError, BrokenPipeError, ConnectionAbortedError):
            self.close_connection = True

    def end_headers(self):
        # tarayıcı eski kopyayı göstermesin
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


class Sunucu(socketserver.ThreadingTCPServer):
    """Aynı anda birden çok istek; kopan bağlantıda gürültü yapmaz."""
    daemon_threads = True
    allow_reuse_address = True

    def handle_error(self, request, client_address):
        pass


def sunucu_baslat(port):
    os.chdir(KLASOR)
    srv = Sunucu(("127.0.0.1", port), Sessiz)
    t = threading.Thread(target=srv.serve_forever, daemon=True)
    t.start()
    return srv


def tarayici_bul():
    for yol in TARAYICILAR:
        tam = os.path.expandvars(yol)
        if os.path.isfile(tam):
            return tam
    return None


def brave_bul():
    yollar = [
        r"%ProgramFiles%\BraveSoftware\Brave-Browser\Application\brave.exe",
        r"%ProgramFiles(x86)%\BraveSoftware\Brave-Browser\Application\brave.exe",
        r"%LocalAppData%\BraveSoftware\Brave-Browser\Application\brave.exe",
    ]
    for yol in yollar:
        tam = os.path.expandvars(yol)
        if os.path.isfile(tam):
            return tam
    return None


def main():
    port, yeni = port_bul()
    if port is None:
        uyari("8777 numaralı bağlantı başka bir program tarafından kullanılıyor. "
              "Kayıtların kaybolmuş gibi görünmemesi için YKS Defterim açılmadı. "
              "Diğer programı kapatıp yeniden dene.")
        return
    srv = sunucu_baslat(port) if yeni else None

    # sunucunun ayağa kalkmasını bekle
    for _ in range(40):
        if not port_bos_mu(port):
            break
        time.sleep(0.05)

    adres = "http://localhost:%d/" % port
    tarayici = tarayici_bul()

    if tarayici:
        # uygulama kipi: adres çubuğu ve sekmeler yok
        p = subprocess.Popen([
            tarayici,
            "--app=" + adres,
            "--window-size=1180,820",
            "--user-data-dir=" + os.path.join(
                os.path.expandvars("%LocalAppData%"), "YKSDefterim", "tarayici"),
        ])
        p.wait()          # pencere kapanana kadar bekle
    else:
        import webbrowser
        webbrowser.open(adres)
        # varsayılan tarayıcıda kapanmayı izleyemeyiz; açık bırak
        try:
            while True:
                time.sleep(3600)
        except KeyboardInterrupt:
            pass

    if srv:
        srv.shutdown()
        srv.server_close()


if __name__ == "__main__":
    main()
