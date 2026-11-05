#!/usr/bin/env python3
"""
Roz subah chalta hai (launchd se): Chrome extension ki auto-CSV (Downloads
folder mein, 5:30 AM pe extension khud banati hai) padhta hai, website ke
data/products.js mein "mrp" (Zepto/Blinkit comparison price) update karta
hai, phir commit + push karta hai. Claude/internet-AI ki zaroorat nahi,
sirf Python + git (dono Mac mein pehle se hain).
"""
import csv, re, glob, os, subprocess, sys
from datetime import date, datetime

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOWNLOADS = os.path.expanduser("~/Downloads")
LOG = os.path.join(os.path.dirname(os.path.abspath(__file__)), "auto-update.log")

def log(msg):
    with open(LOG, "a", encoding="utf-8") as f:
        f.write(f"[{datetime.now().isoformat(timespec='seconds')}] {msg}\n")

def find_csv():
    today = date.today().isoformat()
    exact = os.path.join(DOWNLOADS, f"gupta-sabzi-price-compare-auto-{today}.csv")
    if os.path.exists(exact):
        return exact
    # fallback: sabse recent auto-csv (agar date-mismatch ho, e.g. raat ko chala)
    candidates = sorted(glob.glob(os.path.join(DOWNLOADS, "gupta-sabzi-price-compare-auto-*.csv")),
                         key=os.path.getmtime, reverse=True)
    if candidates and (datetime.now().timestamp() - os.path.getmtime(candidates[0])) < 6*3600:
        return candidates[0]
    return None

def main():
    csv_path = find_csv()
    if not csv_path:
        log("Aaj ki auto-CSV nahi mili Downloads mein — skip.")
        return
    log(f"CSV mili: {csv_path}")

    updates = {}
    with open(csv_path, encoding="utf-8-sig") as f:
        for row in csv.DictReader(f):
            name = (row.get("Product") or "").strip()
            if not name: continue
            prices = []
            for col in ("Zepto", "Blinkit"):
                v = (row.get(col) or "").strip().replace("₹", "")
                if v.isdigit(): prices.append(int(v))
            if prices:
                updates[name] = min(prices)

    if not updates:
        log("CSV mein koi valid price nahi mila — skip.")
        return

    pfile = os.path.join(REPO, "data", "products.js")
    with open(pfile, encoding="utf-8") as f:
        lines = f.readlines()

    changed = 0
    for i, line in enumerate(lines):
        m = re.search(r'name:"([^"]+)"', line)
        if not m: continue
        name = m.group(1)
        if name in updates:
            newline = re.sub(r'mrp:\d+', f'mrp:{updates[name]}', line, count=1)
            if newline != line:
                lines[i] = newline
                changed += 1

    if not changed:
        log("Koi mrp change nahi (sab already same) — skip commit.")
        return

    with open(pfile, "w", encoding="utf-8") as f:
        f.writelines(lines)
    log(f"{changed} products ka mrp update kiya.")

    try:
        subprocess.run(["git", "add", "data/products.js"], cwd=REPO, check=True,
                        capture_output=True, text=True)
        subprocess.run(["git", "commit", "-m",
                         f"Auto daily mrp update from apps ({date.today().isoformat()})\n\n"
                         "launchd script se automatic — Chrome extension ki CSV se."],
                        cwd=REPO, check=True, capture_output=True, text=True)
        push = subprocess.run(["git", "push"], cwd=REPO, check=True,
                               capture_output=True, text=True)
        log("Commit + push ho gaya ✓")
    except subprocess.CalledProcessError as e:
        log(f"Git ERROR: {e}\nstdout={e.stdout}\nstderr={e.stderr}")

if __name__ == "__main__":
    main()
