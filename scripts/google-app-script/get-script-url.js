const getScriptUrl = () => {
  const urlArg = process.argv.find((arg) => arg.startsWith('--url='));
  if (urlArg) {
    return urlArg.split('=')[1];
  }

  if (process.env.NEXT_I18N_URL) {
    return process.env.NEXT_I18N_URL;
  }

  process.stderr.write('錯誤: 請提供 Google App Script URL\n');
  process.stderr.write('用法: npm run i18n:fetch -- --url=YOUR_SCRIPT_URL\n');
  process.stderr.write('或設置環境變數 NEXT_I18N_URL\n');
  process.exit(1);
  return null;
};

module.exports = {
  getScriptUrl,
};
