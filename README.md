```
[Unit]
Description=E ink app
After=network.target

[Service]

# Use full paths for everything

ExecStart=/usr/bin/python3 /home/vedantlohbare/display/fetchanddisplay.py
WorkingDirectory=/home/vedantlohbare/display
StandardOutput=inherit
StandardError=inherit
Restart=always
User=vedantlohbare

[Install]
WantedBy=multi-user.target
```

sudo systemctl enable ink_script.service

sudo systemctl start ink_script.service

sudo systemctl status ink_script.service

journalctl -u ink_script.service -f