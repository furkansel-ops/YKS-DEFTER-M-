const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('favori hocalar mevcut favTeachers verisini ayrı hızlı erişim alanında gösterir',()=>{
  const source=read('src/ui/teachers-v2.ts');
  const css=read('src/ui/teachers-v2.css');

  assert.match(source,/function favoriteNames\(\):Set<string>/);
  assert.match(source,/favTeachers/);
  assert.match(source,/id="teachersV2FavoriteShelf"/);
  assert.match(source,/function renderFavoriteShelf/);
  assert.match(source,/favs\.has\(t\.a\)/);
  assert.match(source,/!state\.subject\|\|t\.d\.includes\(state\.subject\)/);
  assert.match(source,/data-action="favorite"/);
  assert.match(source,/class="teachers-v2-card \$\{favorite\?"is-favorite":""\}"/);
  assert.match(css,/\.teachers-v2-favorite-shelf/);
  assert.match(css,/\.teachers-v2-favorite-row/);
  assert.match(css,/\.teachers-v2-card\.is-favorite/);
});
