// Independent display assets. Replace a theme's transparent image without changing UI.
export const exhibit={
 sleeves:[
  {categoryId:'tools',photoPath:'assets/images/content/tools-01.webp',photoName:'青铜冶炼遗存'},
  {categoryId:'ritual',photoPath:'assets/images/content/ritual-hero.webp',photoName:'祭祀遗址'},
  {categoryId:'cities',photoPath:'assets/images/content/cities-01.webp',photoName:'古城墙遗址'},
  {categoryId:'arts',photoPath:'assets/images/content/arts-hero.webp',photoName:'壁画残片'},
 ].map(photo=>({
  ...photo,imagePath:'assets/images/original-sleeve-cutout.webp',
  source:'用户提供的石质档案袋原图；ChatGPT Image 透明背景处理',
  aiLabel:'概念示范图 / AI 处理',
 })),
 backImage:'assets/images/stone-sleeve-back.webp',
 navigationDial:{
  imagePath:'assets/images/navigation-stone-dial.webp',
  source:'ChatGPT 内置 Image 模型，本轮生成的石质地层轮盘装饰贴图',
  aiLabel:'AI 概念贴图 · 非真实文物',
 },
};
