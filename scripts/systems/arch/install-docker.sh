sudo pacman -S docker
echo '{ "ipv6": true, "fixed-cidr-v6": "fd00::/80", "experimental": true, "ip6tables": true }' > /etc/docker/daemon.json

systemctl restart docker