import React, { useMemo, useState } from "react";
import LEMMAS from "./lemmi.json";

type Decl = 1 | 2 | 3 | 4 | 5;
type NumTag = "sg" | "pl";
const CASES = ["Nominativo","Genitivo","Dativo","Accusativo","Ablativo","Vocativo"] as const;

interface Noun { nom:string; gen:string; gender:"m"|"f"|"n"; decl:Decl; meaning?:string; }
interface Forms { [k: string]: string; }

function pick<T>(a:T[]) { return a[Math.floor(Math.random()*a.length)]; }
function byDecl(d:Decl, data:Noun[]) { return data.filter(l=>l.decl===d); }
function normalize(s:string){return s.trim().toLowerCase().replace(/\s+/g," ").replace(/[āēīōūȳ]/g,(m)=>({"ā":"a","ē":"e","ī":"i","ō":"o","ū":"u","ȳ":"y"} as any)[m]||m);}
function stemFromGen(gen:string,decl:Decl){ if(decl===1)return gen.replace(/ae$/,""); if(decl===2)return gen.replace(/i$/,""); if(decl===3)return gen.replace(/is$/,""); if(decl===4)return gen.replace(/us$/,""); return gen.replace(/ei$/,""); }

function buildForms(n:Noun):Record<NumTag,Forms>{
  const t = stemFromGen(n.gen,n.decl); const sg:Forms={}, pl:Forms={};
  switch(n.decl){
    case 1: sg.Nominativo=n.nom; sg.Genitivo=n.gen; sg.Dativo=t+"ae"; sg.Accusativo=t+"am"; sg.Ablativo=t+"a"; sg.Vocativo=t+"a";
            pl.Nominativo=t+"ae"; pl.Genitivo=t+"arum"; pl.Dativo=t+"is"; pl.Accusativo=t+"as"; pl.Ablativo=t+"is"; pl.Vocativo=t+"ae"; break;
    case 2: {const neut=n.gender==="n";
            const vocSg=/ius$/.test(n.nom)?n.nom.replace(/ius$/,"i"):/us$/.test(n.nom)?n.nom.replace(/us$/,"e"):n.nom;
            sg.Nominativo=n.nom; sg.Genitivo=n.gen; sg.Dativo=t+"o"; sg.Accusativo=t+"um"; sg.Ablativo=t+"o"; sg.Vocativo=vocSg;
            pl.Nominativo=neut?t+"a":t+"i"; pl.Genitivo=t+"orum"; pl.Dativo=t+"is"; pl.Accusativo=neut?t+"a":t+"os"; pl.Ablativo=t+"is"; pl.Vocativo=neut?t+"a":t+"i"; break;}
    case 3: {const neut=n.gender==="n";
            sg.Nominativo=n.nom; sg.Genitivo=n.gen; sg.Dativo=t+"i"; sg.Accusativo=neut?n.nom:t+"em"; sg.Ablativo=t+"e"; sg.Vocativo=n.nom;
            pl.Nominativo=neut?t+"a":t+"es"; pl.Genitivo=t+"um"; pl.Dativo=t+"ibus"; pl.Accusativo=neut?t+"a":t+"es"; pl.Ablativo=t+"ibus"; pl.Vocativo=pl.Nominativo; break;}
    case 4: {const neut=n.gender==="n";
            sg.Nominativo=n.nom; sg.Genitivo=n.gen; sg.Dativo=t+"ui"; sg.Accusativo=neut?n.nom:t+"um"; sg.Ablativo=t+"u"; sg.Vocativo=n.nom;
            pl.Nominativo=neut?t+"ua":t+"us"; pl.Genitivo=t+"uum"; pl.Dativo=t+"ibus"; pl.Accusativo=neut?t+"ua":t+"us"; pl.Ablativo=t+"ibus"; pl.Vocativo=pl.Nominativo; break;}
    case 5: sg.Nominativo=n.nom; sg.Genitivo=n.gen; sg.Dativo=t+"ei"; sg.Accusativo=t+"em"; sg.Ablativo=t+"e"; sg.Vocativo=n.nom;
            pl.Nominativo=t+"es"; pl.Genitivo=t+"erum"; pl.Dativo=t+"ebus"; pl.Accusativo=t+"es"; pl.Ablativo=t+"ebus"; pl.Vocativo=t+"es"; break;
  }
  return {sg,pl};
}

const empty = ()=>({ sg:Object.fromEntries(CASES.map(c=>[c,""])) as Forms, pl:Object.fromEntries(CASES.map(c=>[c,""])) as Forms });

export default function App(){
  const data = LEMMAS as Noun[];
  const [mode,setMode]=useState<"byDecl"|"any">("byDecl");
  const [decl,setDecl]=useState<Decl>(1);
  const [current,setCurrent]=useState<Noun|null>(null);
  const [answers,setAnswers]=useState(empty());
  const [checked,setChecked]=useState(false);
  const [score,setScore]=useState({correct:0,total:0});
  const solution = useMemo(()=>current?buildForms(current):null,[current]);

  function newWord(){ const pool = mode==="byDecl"?byDecl(decl,data):data; setCurrent(pick(pool)); setAnswers(empty()); setChecked(false); }
  function check(){ if(!solution)return; let c=0,t=0; (["sg","pl"] as NumTag[]).forEach(n=>CASES.forEach(k=>{t++; const u=normalize((answers as any)[n][k]); const r=normalize((solution as any)[n][k]); if(u===r)c++;})); setChecked(true); setScore(p=>({correct:p.correct+c,total:p.total+t})); }
  function fillCorrect(){ if(!solution)return; setAnswers({sg:{...solution.sg},pl:{...solution.pl}} as any); setChecked(true); }
  function resetScore(){ setScore({correct:0,total:0}); }

  return (
    <div style={{fontFamily:"system-ui,Arial",padding:16,maxWidth:900,margin:"0 auto"}}>
      <h1>Quiz Declinazioni Latine</h1>
      <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center",marginBottom:12}}>
        <label>Modalità:{" "}
          <select value={mode} onChange={e=>setMode(e.target.value as any)}>
            <option value="byDecl">Scegli declinazione</option>
            <option value="any">Qualsiasi declinazione</option>
          </select>
        </label>
        {mode==="byDecl" && (
          <label>{" "}Declinazione:{" "}
            <select value={decl} onChange={e=>setDecl(Number(e.target.value) as Decl)}>
              <option value={1}>I</option><option value={2}>II</option><option value={3}>III</option><option value={4}>IV</option><option value={5}>V</option>
            </select>
          </label>
        )}
        <button onClick={newWord}>Nuovo sostantivo</button>
        <button onClick={fillCorrect} disabled={!current}>Mostra soluzione</button>
        <button onClick={resetScore}>Azzera punteggio</button>
      </div>
      <div style={{marginBottom:8,fontSize:14,color:"#444"}}>
        Punteggio: <strong>{score.correct}</strong> / {score.total} {score.total>0 && <> — {(100*score.correct/score.total).toFixed(0)}%</>}
      </div>
      {!current && <div style={{fontSize:14,color:"#666"}}>Premi “Nuovo sostantivo”.</div>}
      {current && solution && (
        <div style={{border:"1px solid #ddd",borderRadius:8,padding:12}}>
          <div style={{marginBottom:8}}>
            <strong>Parola:</strong> {current.nom} <span style={{color:"#666"}}>(gen. {current.gen}, decl. {current.decl}, {current.gender})</span> {current.meaning && <span style={{color:"#777"}}> — {current.meaning}</span>}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            {(["sg","pl"] as NumTag[]).map(num=>(
              <div key={num}>
                <div style={{fontSize:12,color:"#666",textTransform:"uppercase",marginBottom:6}}>{num==="sg"?"Singolare":"Plurale"}</div>
                {CASES.map(cn=>{
                  const val = (answers as any)[num][cn];
                  const corr = (solution as any)[num][cn];
                  const ok = checked && normalize(val)===normalize(corr);
                  const bad = checked && !ok;
                  return (
                    <div key={cn} style={{marginBottom:8}}>
                      <label style={{display:"block",fontSize:13,marginBottom:4}}>{cn}</label>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <input
                          value={val}
                          onChange={e=>setAnswers(p=>({...p,[num]:{...(p as any)[num],[cn]:e.target.value}}))}
                          placeholder="scrivi la forma"
                          style={{flex:1,padding:"6px 8px",borderRadius:6,border:"1px solid",borderColor:ok?"#22c55e":bad?"#ef4444":"#ccc"}}
                        />
                        {checked && (ok?"✅":"❌")}
                      </div>
                      {checked && bad && <div style={{fontSize:12,color:"#666"}}>Soluzione: <code>{corr}</code></div>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div style={{marginTop:12}}><button onClick={check}>Finito — correggi</button></div>
        </div>
      )}
    </div>
  );
}
