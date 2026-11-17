# Index every spec in a dtgwg-trust-tasks-tf export (latest version per slug) + ceremonies.
# usage: python tools/index_upstream.py <export dir with specs/ ceremonies/> <out.json>
import os,sys,json,re,yaml
root=sys.argv[1]; out=sys.argv[2]
best={}
def vkey(v): return tuple(int(x) for x in re.findall(r'\d+',v))
for dp,dn,fn in os.walk(os.path.join(root,'specs')):
    if 'spec.md' in fn:
        t=open(os.path.join(dp,'spec.md'),encoding='utf-8').read()
        m=re.match(r'---\n(.*?)\n---',t,re.S)
        if not m: continue
        fm=yaml.safe_load(m.group(1))
        s=fm.get('slug'); v=str(fm.get('version'))
        rec=dict(slug=s,version=v,title=fm.get('title'),summary=fm.get('summary'),category=fm.get('category'),status=fm.get('status'),
          side=(fm.get('sideEffects') or {}).get('level'),discloses=(fm.get('exposure') or {}).get('discloses'),
          proof=(fm.get('proofRequirement') or {}).get('requirement'),authors=fm.get('authors'),
          impl=[k.get('name') if isinstance(k,dict) else k for k in (fm.get('knownImplementations') or [])],
          related=fm.get('related'),nversions=0)
        if s not in best or vkey(v)>vkey(best[s]['version']):
            n=best.get(s,{}).get('nversions',0); best[s]=rec; rec['nversions']=n
        best[s]['nversions']+=1
cer=[]
for dp,dn,fn in os.walk(os.path.join(root,'ceremonies')):
    if 'ceremony.json' in fn:
        j=json.load(open(os.path.join(dp,'ceremony.json'),encoding='utf-8'))
        cer.append(dict(slug=j.get('slug'),path=os.path.relpath(dp,root).replace(chr(92),'/'),title=j.get('title'),summary=j.get('summary') or j.get('description'),
          steps={k:(v.get('type') or '').split('/spec/')[-1] for k,v in j.get('steps',{}).items()}))
json.dump(dict(specs=sorted(best.values(),key=lambda r:r['slug']),ceremonies=cer),open(out,'w',encoding='utf-8'),indent=1,default=str)
from collections import Counter
print(len(best),'slugs');print(Counter(r['category'] for r in best.values()).most_common())
print(Counter(r['slug'].split('/')[0] for r in best.values()).most_common())
print(len(cer),'ceremonies')
