# Gunakan image Nginx Alpine yang sangat ringan & cepat (< 25MB)
FROM nginx:alpine

# Label Metadata
LABEL maintainer="Dompet Keluarga Team"
LABEL description="Production Docker container for Dompet Keluarga V2 Web Application"
LABEL version="2.3.0"

# Hapus konfigurasi default Nginx
RUN rm -rf /etc/nginx/conf.d/* /usr/share/nginx/html/*

# Salin konfigurasi kustom Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Salin seluruh aset frontend statis ke direktori HTML Nginx
COPY . /usr/share/nginx/html/

# Pastikan permission aman
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Expose port 80 untuk akses web
EXPOSE 80

# Healthcheck untuk memastikan web server berjalan normal
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Jalankan Nginx di foreground
CMD ["nginx", "-g", "daemon off;"]
