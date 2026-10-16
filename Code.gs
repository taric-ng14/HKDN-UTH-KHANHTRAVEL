/**
 * KHANHTRAVEL – HKDN | Google Apps Script (lưu kết quả vào Google Sheet)
 * Gắn script này vào Google Sheet muốn lưu kết quả (Tiện ích mở rộng > Apps Script).
 * Project Settings > Script properties: thêm SECRET = <chuỗi bí mật, trùng với biến môi trường trên Vercel>
 * Deploy > New deployment > Web app > Execute as: Me | Who has access: Anyone
 */
const SHEET_NAME = 'KET_QUA';
const HEADERS = ['Thời gian', 'Nhóm', 'Tổ', 'Phòng', 'Mã đề tài', 'Đề tài', 'Trưởng nhóm', 'Thành viên'];

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#13B5CE').setFontColor('#ffffff');
    sh.setFrozenRows(1);
  }
  return sh;
}

function readAll_() {
  const sh = getSheet_();
  const last = sh.getLastRow();
  if (last < 2) return [];
  return sh.getRange(2, 1, last - 1, HEADERS.length).getValues().map(function (r) {
    return { time: String(r[0]), nhom: Number(r[1]), to: Number(r[2]), phong: r[3], topicId: r[4], deTai: r[5], truong: r[6], members: String(r[7]).split(', ') };
  });
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function authOk_(secret) {
  const s = PropertiesService.getScriptProperties().getProperty('SECRET');
  return !s || s === secret;
}

function doGet(e) {
  if (!authOk_(e.parameter.secret)) return json_({ ok: false, error: 'unauthorized' });
  return json_({ ok: true, selections: readAll_() });
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  if (!authOk_(body.secret)) return json_({ ok: false, error: 'unauthorized' });
  const rec = body.record;
  const lock = LockService.getScriptLock();
  lock.waitLock(20000); // chống 2 tổ chọn cùng lúc
  try {
    const all = readAll_();
    if (all.some(function (s) { return s.topicId === rec.topicId; }))
      return json_({ ok: false, code: 'TOPIC_TAKEN', error: 'Đề tài này vừa được tổ khác chọn.', selections: all });
    if (all.some(function (s) { return s.nhom === rec.nhom && s.to === rec.to; }))
      return json_({ ok: false, code: 'TEAM_DONE', error: 'Tổ của bạn đã chọn đề tài rồi.', selections: all });
    const time = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss');
    getSheet_().appendRow([time, rec.nhom, rec.to, rec.phong, rec.topicId, rec.deTai, rec.truong, rec.members.join(', ')]);
    SpreadsheetApp.flush();
    return json_({ ok: true, selections: readAll_() });
  } finally {
    lock.releaseLock();
  }
}
