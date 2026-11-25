"""Build the public evidence catalog from explicitly approved local documents."""
import argparse
import hashlib
import json
import re
import unicodedata
from pathlib import Path
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parent
FILES = ["(GoogleAIProfessional", "python for AI DS", "AI App", "GenAI", "ML", "Deloitte"]
def normalize(text):
    return " ".join(unicodedata.normalize("NFKC", text).replace("\x00", "fi").split())
def build(resume, certificates=None, brief=None):
    records = []
    def append(path, page, section, text):
        text = normalize(text)
        if text:
            records.append(dict(source=path.name, location=page, section=section, text=text,
                                version=hashlib.sha256(path.read_bytes()).hexdigest()[:16]))
    section = "Profile"
    for page, obj in enumerate(PdfReader(resume).pages, 1):
        bucket = []
        for line in obj.extract_text().splitlines():
            line = normalize(line)
            if not line or "@" in line or re.search(r'\+92|linkedin.com|github.com', line, re.I): continue
            heading = re.match(r'^(EDUCATION|EXPERIENCE|PROJECTS|TECHNICAL SKILLS|SKILLS|CERTIFICATIONS|TerraTrace AI|RAG Document QA|VoxAI|NexoRa|Data Engineering Pipelines|Skyline Builders|Karachi Development Authority)',line,re.I)
            if heading or (sum(map(len,bucket))>750 and not line[0].isalnum()):
                append(resume,page,section," ".join(bucket)); bucket=[]
                if heading: section=heading[0]
            bucket.append(line)
        append(resume,page,section," ".join(bucket))
    records=[r for r in records if len(r["text"])>25 and r["section"].lower()!=r["text"].lower()]
    if certificates is None and brief is None:
        old=json.loads((ROOT/"evidence.json").read_text(encoding="utf8"))
        return records+[r for r in old if r["section"]=="Certifications" or str(r["location"]).startswith("Department ")]
    for name in FILES:
        path=certificates/(name+".pdf")
        text=PdfReader(path).pages[0].extract_text()
        text=re.split(r'User\s+Verification\s+Code',text,flags=re.I)[0]
        append(path,1,"Certifications",text[:1600])
    raw=brief.read_text(encoding="utf-8-sig")
    for block in re.split(r'(?m)^## DEPARTMENT ',raw)[1:]:
        intro=re.search(r'Automatic narration:\s*"([^"]+)"',block)
        if intro: append(brief,"Department "+block[:2],block.splitlines()[0],intro[1])
    return records
if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("resume",type=Path)
    for name in ("certificates","brief"):p.add_argument(name,type=Path,nargs="?")
    records=build(**vars(p.parse_args()))
    (ROOT/"evidence.json").write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding="utf-8")
    print(len(records),"public evidence records")


