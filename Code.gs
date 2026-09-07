const SPREADSHEET_URL =
  'https://docs.google.com/spreadsheets/d/1MIQiPly79CmfH0mvzCbUdFbTZD5DSciRuymNlypNLvI/edit';

const SHEET_NAME = 'Responses';
const ADMIN_KEY = 'adminPKNSTAN2026';
const SUBMIT_KEY = 'submitPKNSTAN2026';

const VALID_PROGRAMS = [
  'D-IV Akuntansi Sektor Publik',
  'D-IV Manajemen Aset Publik',
  'D-IV Manajemen Keuangan Negara',
  'D-III Akuntansi',
  'D-III Pajak',
  'D-III Kepabeanan dan Cukai',
  'D-III Kebendaharaan Negara',
  'D-III Manajemen Aset',
  'D-III PBB/Penilai'
];

const HEADERS = ['timestamp','age','study_program','cohort','level',
  'student_status','gender','self_manage','transactions','whatsapp',
  'FS1','FS2','FS3','FS4','ATR1','ATR2','ATR3','ATR4','AFS1','AFS2','AFS3','AFS4','AFS5','AFS6','BC1','BC3','BC4','BC5','FL1','FL2','FL3','FL4','FL5','FA2','FA3','FA4','FA5','FA6','RFC1','RFC2','RFC3','RFC4','RFC5','RFC6'];

function getSpreadsheet_(){
  return SpreadsheetApp.openByUrl(SPREADSHEET_URL);
}

function getSheet_(){
  const ss=getSpreadsheet_();
  let sh=ss.getSheetByName(SHEET_NAME);
  if(!sh) sh=ss.insertSheet(SHEET_NAME);
  if(sh.getLastRow()===0) sh.appendRow(HEADERS);
  return sh;
}

function json_(obj, callback){
  const text=JSON.stringify(obj);
  if(callback) return ContentService.createTextOutput(callback+'('+text+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
  return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e){
  const p=e&&e.parameter?e.parameter:{};
  if(p.action==='submit') return submit_(p);
  if(p.action==='data') return data_(p);
  return json_({ok:true,message:'Google Sheets backend aktif.'},p.callback);
}

function doPost(e){
  const p=e&&e.parameter?e.parameter:{};
  if(p.action==='submit') return submit_(p);
  return json_({ok:false,message:'Aksi tidak dikenali.'},p.callback);
}

function submit_(p){
  if(p.key!==SUBMIT_KEY) return json_({ok:false,message:'Kunci submit tidak valid.'},p.callback);
  const required=['age','whatsapp','study_program','cohort','level','student_status','gender','self_manage','transactions'];
  for(const k of required) if(!p[k]) return json_({ok:false,message:'Data '+k+' belum lengkap.'},p.callback);
  if(Number(p.age)<18) return json_({ok:false,message:'Usia minimal 18 tahun.'},p.callback);
  if(!/^[0-9+()\s-]{9,20}$/.test(String(p.whatsapp||''))) return json_({ok:false,message:'Nomor WhatsApp tidak valid.'},p.callback);
  if(p.student_status!=='Aktif') return json_({ok:false,message:'Responden harus mahasiswa aktif.'},p.callback);
  if(p.self_manage!=='Ya') return json_({ok:false,message:'Responden harus mengelola keuangan sendiri.'},p.callback);
  if(p.transactions!=='Ya') return json_({ok:false,message:'Responden harus melakukan transaksi.'},p.callback);
  if(!['2022','2023','2024','2025','2026'].includes(String(p.cohort))) return json_({ok:false,message:'Angkatan tidak valid.'},p.callback);
  if(!VALID_PROGRAMS.includes(String(p.study_program))) return json_({ok:false,message:'Program studi tidak valid.'},p.callback);
  if(!['Perempuan','Laki-laki'].includes(String(p.gender))) return json_({ok:false,message:'Jenis kelamin tidak valid.'},p.callback);
  const sh=getSheet_();
  ensureWhatsappColumn_(sh);
  const row=HEADERS.map(function(h){ if(h==='timestamp') return new Date(); return p[h]||''; });
  sh.appendRow(row);
  return json_({ok:true,message:'Tersimpan'},p.callback);
}

function data_(p){
  if(p.key!==ADMIN_KEY) return json_({ok:false,message:'Kunci admin tidak valid.'},p.callback);
  const sh=getSheet_();
  const values=sh.getDataRange().getValues();
  if(values.length<2) return json_({ok:true,headers:HEADERS,rows:[]},p.callback);
  const rows=values.slice(1).map(function(r){
    const o={};
    HEADERS.forEach(function(h,i){o[h]=r[i] instanceof Date?r[i].toISOString():r[i];});
    return o;
  });
  return json_({ok:true,headers:HEADERS,rows:rows},p.callback);
}

function cekAkses(){
  const ss=getSpreadsheet_();
  Logger.log('Nama Spreadsheet: '+ss.getName());
  Logger.log('URL Spreadsheet: '+ss.getUrl());
  Logger.log('Koneksi berhasil.');
}

function hapusKolomNama(){
  const ss=getSpreadsheet_();
  let sh=ss.getSheetByName(SHEET_NAME);
  if(!sh){
    sh=ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    Logger.log('Responses dibuat tanpa kolom nama.');
    return;
  }
  const lastCol=sh.getLastColumn();
  if(lastCol===0){
    sh.appendRow(HEADERS);
    Logger.log('Responses dibuat tanpa kolom nama.');
    return;
  }
  const headers=sh.getRange(1,1,1,lastCol).getValues()[0].map(String);
  const idx=headers.indexOf('respondent_name');
  if(idx!==-1){
    sh.deleteColumn(idx+1);
    Logger.log('Kolom respondent_name dihapus.');
  }
  ensureWhatsappColumn_(sh);
  sh.getRange(1,1,1,HEADERS.length).setValues([HEADERS]);
  Logger.log('Responses anonim, data lama dipertahankan, dan kolom WhatsApp ditambahkan.');
}

function ensureWhatsappColumn_(sh){
  const lastCol=sh.getLastColumn();
  if(lastCol===0){
    sh.appendRow(HEADERS);
    return;
  }
  let headers=sh.getRange(1,1,1,lastCol).getValues()[0].map(String);
  let idx=headers.indexOf('whatsapp');
  if(idx===-1){
    const transactionsIdx=headers.indexOf('transactions');
    const insertAfter=transactionsIdx!==-1 ? transactionsIdx+1 : lastCol;
    sh.insertColumnAfter(insertAfter);
    sh.getRange(1,insertAfter+1).setValue('whatsapp');
  }
  headers=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0].map(String);
  // Susun header baru tanpa memindahkan/menghapus data lama.
  const currentWidth=sh.getLastColumn();
  if(currentWidth<HEADERS.length){
    sh.insertColumnsAfter(currentWidth,HEADERS.length-currentWidth);
  }
  sh.getRange(1,1,1,HEADERS.length).setValues([HEADERS]);
}

function tesSpreadsheet(){
  const ss=getSpreadsheet_();
  let sh=ss.getSheetByName(SHEET_NAME);
  if(!sh) sh=ss.insertSheet(SHEET_NAME);
  if(sh.getLastRow()===0) sh.appendRow(HEADERS);
  const row=HEADERS.map(function(h){
    if(h==='timestamp') return new Date();
    if(h==='age') return 18;
    if(h==='study_program') return 'TES';
    if(h==='cohort') return '2026';
    if(h==='level') return 'Tingkat 1';
    if(h==='student_status') return 'Aktif';
    if(h==='gender') return 'Perempuan';
    if(h==='self_manage') return 'Ya';
    if(h==='transactions') return 'Ya';
    if(h==='whatsapp') return '081234567890';
    return '';
  });
  sh.appendRow(row);
  Logger.log('BERHASIL: TES KONEKSI masuk ke Responses.');
}
