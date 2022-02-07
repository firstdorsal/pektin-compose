sudo systemctl disable systemd-resolved
sudo systemctl stop systemd-resolved
sudo rm /etc/resolv.conf
echo 'nameserver 1.1.1.1' | sudo tee /etc/resolv.conf