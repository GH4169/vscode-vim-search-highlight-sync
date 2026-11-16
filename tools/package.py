#!/usr/bin/env python3
"""Build a VSIX using the Python standard library; no npm dependencies."""
from pathlib import Path
import json, zipfile, xml.etree.ElementTree as ET

root = Path(__file__).resolve().parents[1]
p = json.loads((root / "package.json").read_text())
ns = "http://schemas.microsoft.com/developer/vsx-schema/2011"
ET.register_namespace("", ns)
manifest = ET.Element("{%s}PackageManifest" % ns, {"Version": "2.0.0"})
meta = ET.SubElement(manifest, "Metadata")
ET.SubElement(
    meta,
    "Identity",
    {
        "Language": "en-US",
        "Id": p["name"],
        "Version": p["version"],
        "Publisher": p["publisher"],
    },
)
ET.SubElement(meta, "DisplayName").text = p["displayName"]
ET.SubElement(
    meta, "Description", {"{http://www.w3.org/XML/1998/namespace}space": "preserve"}
).text = p["description"]
ET.SubElement(meta, "Tags").text = "vim,productivity"
props = ET.SubElement(meta, "Properties")
for key, value in {
    "Microsoft.VisualStudio.Code.Engine": p["engines"]["vscode"],
    "Microsoft.VisualStudio.Code.ExtensionDependencies": ",".join(
        p.get("extensionDependencies", [])
    ),
    "Microsoft.VisualStudio.Code.ExtensionKind": ",".join(p["extensionKind"]),
}.items():
    ET.SubElement(props, "Property", {"Id": key, "Value": value})
targets = ET.SubElement(manifest, "Installation")
ET.SubElement(targets, "InstallationTarget", {"Id": "Microsoft.VisualStudio.Code"})
ET.SubElement(manifest, "Dependencies")
assets = ET.SubElement(manifest, "Assets")
ET.SubElement(
    assets,
    "Asset",
    {
        "Type": "Microsoft.VisualStudio.Code.Manifest",
        "Path": "extension/package.json",
        "Addressable": "true",
    },
)
out = root / "dist" / (p["publisher"] + "." + p["name"] + "-" + p["version"] + ".vsix")
out.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
    z.writestr(
        "extension.vsixmanifest",
        ET.tostring(manifest, encoding="utf-8", xml_declaration=True),
    )
    z.writestr(
        "[Content_Types].xml",
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="json" ContentType="application/json"/><Default Extension="js" ContentType="application/javascript"/><Default Extension="vsixmanifest" ContentType="text/xml"/><Default Extension="md" ContentType="text/plain"/><Default Extension="py" ContentType="text/plain"/><Default Extension="ps1" ContentType="text/plain"/><Default Extension="sh" ContentType="text/plain"/><Default Extension="vim" ContentType="text/plain"/><Default Extension="txt" ContentType="text/plain"/><Default Extension="c" ContentType="text/plain"/><Default Extension="h" ContentType="text/plain"/></Types>',
    )
    for file in sorted(root.rglob("*")):
        rel = file.relative_to(root)
        if not file.is_file() or any(
            x
            in {
                ".git",
                "dist",
                "node_modules",
                "test-results",
                "__pycache__",
                "backups",
                ".runtime",
                "build",
                "test",
            }
            for x in rel.parts
        ):
            continue
        if file.suffix in {".so", ".vsix", ".pyc"}:
            continue
        z.write(file, "extension/" + rel.as_posix())
print(out)
