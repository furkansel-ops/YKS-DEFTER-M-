const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('favori hocalar mevcut yıldız verisini lazy hızlı erişim alanında gösterir',()=>{
  const core=read('src/ui/teachers-v2.ts');
  const library=read('src/ui/teachers-v2-library.ts');
  const css=read('src/ui/teachers-v2.css');

  assert.match(core,/function favoriteNames\(\):Set<string>/);
  assert.match(core,/favTeachers/);
  assert.match(core,/data-action="favorite"/);
  assert.match(library,/function favoriteTeacherCards/);
  assert.match(library,/function renderFavoriteTeachers/);
  assert.match(library,/id="teachersV2FavoriteShelf"/);
  assert.match(library,/data-library-action="teacher-open"/);
  assert.match(library,/data-library-action="teacher-remove"/);
  assert.match(library,/renderFavoriteTeachers\(force\)/);
  assert.match(css,/\.teachers-v2-favorite-shelf/);
  assert.match(css,/\.teachers-v2-favorite-row/);
  assert.match(css,/\.teachers-v2-card\.is-favorite/);
});
