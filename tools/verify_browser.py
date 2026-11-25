#!/usr/bin/env python3
"""Headless Chrome check of real vendored GLTFLoader + WebGL; localhost server required."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
REPORTS = ROOT / "tools/reports"
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, channel="chrome")
    page = browser.new_page(viewport={"width": 1280, "height": 900}, device_scale_factor=1)
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
    response = page.goto("http://127.0.0.1:8765/tools/glb-check.html", wait_until="networkidle")
    assert response.status == 200
    page.wait_for_function("window.checkDone === true", timeout=60000)
    failure = page.evaluate("window.checkError || null")
    assert failure is None, failure
    result = page.evaluate("window.checkResult")
    result["browser_version"] = browser.version
    result["errors"] = errors
    REPORTS.mkdir(exist_ok=True)
    page.screenshot(path=str(REPORTS / "glb-comparison.png"), full_page=True)
    (REPORTS / "browser-validation.json").write_text(json.dumps(result, indent=2)+"\n")
    assert not errors, errors
    for view in result["measurements"]:
        assert view["original"]["triangles"] == view["optimized"]["triangles"] == 42154
        assert view["optimized"]["calls"] == 2
        assert view["meanAbsoluteChannelError"] < .1, view
    print(json.dumps(result, indent=2))
    browser.close()
