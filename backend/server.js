const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req,res)=>res.json({ok:true, service:'CFC Backend LITE'}));
app.post('/exam/submit', (req,res)=>{
  res.json({ok:true, saved:true, echo:req.body||null});
});

const PORT = process.env.PORT || 7860;
app.listen(PORT, ()=>console.log(`CFC Backend LITE running on :${PORT}`));
