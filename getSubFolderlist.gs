// Base code is on https://qiita.com/masatler/items/88e16a014eba198f3494
// customized by kimipooh.
// メニューに表示させる

// 探索を開始するフォルダ
var FolderID = "[Folder ID]"; 

function onOpen(e){
    var arr = [
        {name: "リスト作成", functionName: "getSubFolderlist"}
    ];
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    spreadsheet.addMenu("GAS", arr);
}

// メイン処理
function getSubFolderlist() {
  insertNewSheet();
  listAllFandF();
}

// 新シートを挿入、今日日付
function insertNewSheet() {
  // 日付取得
  var td = new Date();

  // YYYYMMDD形式に変換（考えた人、賢いなあ）
  var year_str = td.getFullYear();
  var month_str = td.getMonth()+ 1; // monthはなんと0-11
  var day_str = td.getDate();

  month_str = ('0' + month_str).slice(-2);
  day_str = ('0' + day_str).slice(-2);

  format_str = 'YYYYMMDD';
  format_str = format_str.replace(/YYYY/g, year_str);
  format_str = format_str.replace(/MM/g, month_str);
  format_str = format_str.replace(/DD/g, day_str);

  // 一番左にスプレッドシートを作成、名称はYYYYMMDD
  var objSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var newsheet = objSpreadsheet.getSheetByName(format_str);

  if(newsheet){
    newsheet.clear();
  }else{
    newsheet = objSpreadsheet.insertSheet(format_str, 0);
  }
  // 保存するシートに移動（アクティブにする）
  newsheet.activate();
}


// 開始フォルダの下の全てのフォルダを取得後、全てのファイルを取得
// http://excel-ubara.com/apps_script1/GAS038.html と037を参考にした
function listAllFandF() {

  var sheet = SpreadsheetApp.getActiveSheet();
  var key = FolderID; // 探索を開始するフォルダ（固定してる）
  var stt = DriveApp.getFolderById(key);
  var name = "";
  var i = 0; // 配列の行位置を記録している
  var j = 0; // 配列を上から拾って、サブフォルダ探索。探索は配列の二行目から行う
  var folderlist = new Array(); //フォルダリストを格納する配列

  sheet.clear() //シートをクリア

  // 一行目を配列に書き出す（開始フォルダ）
  folderlist.push([stt, key]);

  // nameに開始フォルダ追加する
  name = stt + " > ";

  // フォルダリストを配列に書き出す
  do {
    //フォルダ一覧を取得
    var folders = DriveApp.searchFolders("'"+key+"' in parents");

    //フォルダ一覧からフォルダを順に取り出し、配列にフォルダ名称とIdを出力
    while(folders.hasNext()){
      i++;
      var folder = folders.next();
      var tmparray = new Array();
      tmparray.push(name + folder.getName());
      tmparray.push(folder.getId());
      tmparray.push(folder.getDateCreated());
      tmparray.push(folder.getLastUpdated());
      if(folder.getOwner()){
        tmparray.push(folder.getOwner());
      }else{ // チームドライブはオーナーなし
        tmparray.push("チームドライブ");
      }
      tmparray.push(folder.getUrl());
      folderlist.push(tmparray);
    }

    //配列の上から順にフォルダ名称（>をつける）とIdを取り出す
    j++;
    // j（配列を取りに行こうとする行数）がi（配列の行数、ゼロから始まる）と同じか小さいなら
    if(j <= i){
      name = folderlist[j][0] + " > ";
      key = folderlist[j][1];
    }
  } while (j <= i); //配列を最後まで舐める
  // folderlist配列（フォルダリスト）を使って、フォルダ下にあるファイルを取得しシートに吐き出し
  j = 1; //シートへの出力行
  // ヘッダ記入：直書きで汚くて申し訳ない
  sheet.getRange(j, 1).setValue("フォルダ名");
  sheet.getRange(j, 2).setValue("作成日");
  sheet.getRange(j, 3).setValue("最終更新日");
  sheet.getRange(j, 4).setValue("オーナー");
  sheet.getRange(j, 5).setValue("URL");
  j++;
  // ボディ記入
  for (i=1; i<=folderlist.length-1; i++) {
    var l=1;
    for (k=0; k<=folderlist[i].length-1; k++) {
      if(k == 1){
        continue;
      }
      sheet.getRange(j, l++).setValue(folderlist[i][k]);
    }
    j++;
  } 
}