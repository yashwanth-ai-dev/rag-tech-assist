import re

class ContextBooster:
    def __init__(self):
        self.rules = {
            "windows": [
                r"cmd", r"powershell", r"event viewer", r"win", r"windows",
                r"gpupdate", r"registry", r"dll", r"task manager"
            ],
            "linux": [
                r"systemctl", r"sudo", r"apt", r"yum", r"journalctl",
                r"chmod", r"chown", r"linux", r"ubuntu", r"centos"
            ],
            "networking": [
                r"ipconfig", r"ifconfig", r"wifi", r"dns", r"dhcp",
                r"gateway", r"router", r"internet", r"ping", r"tracert"
            ],
            "active_directory": [
                r"ad", r"domain", r"gpo", r"ou", r"ldap",
                r"group policy", r"dc", r"forest"
            ],
            "hardware": [
                r"cpu", r"gpu", r"ram", r"ssd", r"hdd",
                r"temperature", r"overheating", r"fan"
            ],
            "devices": [
                r"printer", r"usb", r"keyboard", r"mouse",
                r"driver", r"display", r"monitor"
            ]
        }

    def detect_category(self, query):
        query = query.lower()

        for category, patterns in self.rules.items():
            for p in patterns:
                if re.search(p, query):
                    return category

        return "general"

    def boost(self, query, docs):
        category = self.detect_category(query)

        boosted = []
        for d in docs:
            content = d["content"].lower()
            score = 0

            if category in ["windows", "networking"] and "windows" in content:
                score += 3
            if category == "linux" and "linux" in content:
                score += 3
            if category == "networking" and any(key in content for key in ["dns", "ip", "wifi"]):
                score += 3
            if category == "active_directory" and any(key in content for key in ["domain", "ad", "gpo"]):
                score += 3
            if category == "hardware" and any(key in content for key in ["cpu", "gpu", "temp"]):
                score += 3
            if category == "devices" and any(key in content for key in ["printer", "usb"]):
                score += 3

            boosted.append((score, d))

        boosted.sort(key=lambda x: x[0], reverse=True)
        return [d for _, d in boosted]
