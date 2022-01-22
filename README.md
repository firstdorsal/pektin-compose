// TODO check if multi node is really enabled

curl --http2-prior-knowledge -H 'accept: application/dns-message' -v 'http://localhost:8090/dns-query?dns=jz4BMAABAAAAAAAACXZvbmZvcmVsbAJkZQAAAQAB' | base64
