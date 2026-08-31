const fs=require('fs'); 
let c=fs.readFileSync('app/page.tsx','utf8'); 

c=c.replace('  geoPath,\n} from "./candidate-helpers";', '  geoPath,\n  geoBounds,\n} from "./candidate-helpers";'); 

c=c.replace('const [geo, setGeo] = useState<any[]>([]);', 'const [geo, setGeo] = useState<any[]>([]);\n  const [geoProvs, setGeoProvs] = useState<any[]>([]);\n  const [geoDists, setGeoDists] = useState<any[]>([]);\n  const [viewBox, setViewBox] = useState("0 0 390 430");'); 

c=c.replace('.catch(() => setGeo([]));\n  }, []);', '.catch(() => setGeo([]));\n    fetch("/peru-provincias.geojson").then(r=>r.json()).then(j=>setGeoProvs(j.features||[])).catch(()=>setGeoProvs([]));\n    fetch("/peru-distritos.geojson").then(r=>r.json()).then(j=>setGeoDists(j.features||[])).catch(()=>setGeoDists([]));\n  }, []);'); 

c=c.replace('  useEffect(() => {\n    let active = true;', '  const renderFeatures = useMemo(() => {\n    if (level === "6" && prov) return geoDists.filter(f => f.properties.IDPROV === prov);\n    if (level === "5" && dep) return geoProvs.filter(f => f.properties.FIRST_IDPR?.startsWith(dep));\n    return geo;\n  }, [level, dep, prov, geo, geoProvs, geoDists]);\n\n  useEffect(() => {\n    let targetFeature = null;\n    if (level === "6" && prov && geoProvs.length) targetFeature = geoProvs.find(f => f.properties.FIRST_IDPR === prov);\n    else if (level === "5" && dep && geo.length) targetFeature = geo.find(f => jneCodeForMap(f.properties.NOMBDEP) === dep);\n    if (targetFeature) {\n      const [minX, minY, maxX, maxY] = geoBounds(targetFeature.geometry);\n      const width = maxX - minX; const height = maxY - minY; const pad = Math.max(width, height) * 0.15;\n      setViewBox(${minX - pad}   );\n    } else {\n      setViewBox("0 0 390 430");\n    }\n  }, [level, dep, prov, geo, geoProvs, geoDists]);\n\n  useEffect(() => {\n    let active = true;'); 

const svgRegex = /<svg[\s\S]*?<\/svg>/;
const newSvg = '<svg viewBox={viewBox} role="img" aria-label="Mapa interactivo del Perú" style={{transition:"viewBox 0.5s ease-in-out"}}>{renderFeatures.map((f: any) => { let code="", name="", isSelected=false, onClick=()=>{}; if (level==="6" && prov) { code=f.properties.IDDIST; name=f.properties.NOMBDIST; isSelected = dist===code; onClick=()=>setDist(code); } else if (level==="5" && dep) { code=f.properties.FIRST_IDPR; name=f.properties.NOMBPROV; isSelected = prov===code; onClick=()=>{setProv(code);setLevel("6");}; } else { code = jneCodeForMap(f.properties.NOMBDEP); name = f.properties.NOMBDEP; isSelected = dep===code; onClick=()=>{if(code){setDep(code);setLevel("5");}}; } return (<path key={code||name} data-name={fmt(name)} data-jne-code={code} d={geoPath(f.geometry)} className={isSelected?"selected":""} onClick={onClick}><title>{fmt(name)}</title></path>); })}</svg>';

c = c.replace(svgRegex, newSvg);

fs.writeFileSync('app/page.tsx', c);
