import fs from 'fs/promises';

const DIST_FOLDER = './dist';
const DEFAULT_LANGUAGE_FILE = 'pt-BR.json';

const writeFile = async (languageFile, content) => {
  const langauge = languageFile.slice(0, 5);
  const path = languageFile === DEFAULT_LANGUAGE_FILE ? '/index.html' : `/${langauge}/index.html`;

  await fs.access(DIST_FOLDER, fs.constants.F_OK).catch(() => fs.mkdir(DIST_FOLDER));

  if (languageFile !== DEFAULT_LANGUAGE_FILE) {
    const languageFolderPath = `${DIST_FOLDER}/${langauge}`;
    await fs.access(languageFolderPath, fs.constants.F_OK).catch(() => fs.mkdir(languageFolderPath));
  }

  return fs.writeFile(DIST_FOLDER + path, content);
};

const generateHtml = async (languageFile) => {
  const [languageObject, file] = await Promise.all([
    import(`./i18n/${languageFile}`, {assert: {type: 'json'}}),
    fs.readFile('index.html', {encoding: 'utf-8'}),
  ]);

  const translated = file.replace(/{{(.+?)}}/g, (_, key) => languageObject.default[key] || key);

  await writeFile(languageFile, translated);
};

const main = async () => {
  const languageFiles = await fs.readdir('./i18n');
  for (const languageFile of languageFiles) {
    await generateHtml(languageFile);
  }
};

main();
