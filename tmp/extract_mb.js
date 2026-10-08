const fs = require("fs");
const html = fs.readFileSync("/tmp/magicbricks_page2.html", "utf8");

// Split by card container
const cardSnippets = html.split('<div class="mb-srp__card ');
console.log("Card split count:", cardSnippets.length - 1);

const results = [];

cardSnippets.slice(1).forEach((snippet, index) => {
  // Title
  const titleMatch = snippet.match(/<h2 class="mb-srp__card--title"[^>]*>([\s\S]*?)<\/h2>/i);
  const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() : "";

  // Price
  const priceMatch = snippet.match(/<div class="mb-srp__card__price--amount"[^>]*>([\s\S]*?)<\/div>/i);
  const price = priceMatch ? priceMatch[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() : "";

  // Rate per sqft
  const rateMatch = snippet.match(/<div class="mb-srp__card__price--size"[^>]*>([\s\S]*?)<\/div>/i);
  const rate = rateMatch ? rateMatch[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() : "";

  // Summary / specs - carpet/plot area
  const areaMatch = snippet.match(/<div class="mb-srp__card__summary--value"[^>]*>([\s\S]*?)<\/div>/i);
  const area = areaMatch ? areaMatch[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() : "";

  // All summary label and values
  const labels = [];
  const labelRegex = /<div class="mb-srp__card__summary--label"[^>]*>([\s\S]*?)<\/div>/gi;
  let lm;
  while ((lm = labelRegex.exec(snippet)) !== null) {
    labels.push(lm[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim());
  }

  const values = [];
  const valRegex = /<div class="mb-srp__card__summary--value"[^>]*>([\s\S]*?)<\/div>/gi;
  let vm;
  while ((vm = valRegex.exec(snippet)) !== null) {
    values.push(vm[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim());
  }

  const specs = {};
  labels.forEach((l, idx) => {
    specs[l] = values[idx] || "";
  });

  // Description
  const descMatch = snippet.match(/<p class="mb-srp__card--desc--text"[^>]*>([\s\S]*?)<\/p>/i);
  let desc = descMatch ? descMatch[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() : "";
  desc = desc.replace(/Read more/gi, "").replace(/Read less/gi, "").trim();

  // Images - look for img tags, data-src, src, data-orig
  const images = [];
  const imgRegex = /<img[^>]+(?:src|data-src|data-orig)=["']([^"']+)["']/gi;
  let im;
  while ((im = imgRegex.exec(snippet)) !== null) {
    const url = im[1];
    if (url && (url.includes("staticmb.com") || url.includes("mbimages") || url.includes("property")) && !url.includes("blank.gif") && !url.includes("icon") && !url.includes("badge")) {
      images.push(url);
    }
  }

  // Also check any background-image or JSON data inside the card
  const jsonMatch = snippet.match(/data-obj='([^']+)'/i) || snippet.match(/data-obj="([^"]+)"/i);
  let dataObj = null;
  if (jsonMatch) {
    try {
      dataObj = JSON.parse(jsonMatch[1]);
    } catch(e) {}
  }

  // Society or project name if available
  const societyMatch = snippet.match(/<a[^>]*class="mb-srp__card__society"[^>]*>([\s\S]*?)<\/a>/i) ||
                       snippet.match(/class="mb-srp__card--title--society"[^>]*>([\s\S]*?)<\/a>/i);
  const society = societyMatch ? societyMatch[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() : "";

  // Locality
  const locMatch = title.match(/in\s+(.*?)\s+Nagpur/i);
  const locality = locMatch ? locMatch[1].trim() : "";

  if (title) {
    results.push({
      index: index + 1,
      title,
      price,
      rate,
      area,
      specs,
      desc,
      society,
      locality,
      images: [...new Set(images)],
      dataObj
    });
  }
});

console.log(`Parsed ${results.length} properties!`);
fs.writeFileSync("/tmp/parsed_magicbricks.json", JSON.stringify(results, null, 2));

results.slice(0, 10).forEach(r => {
  console.log(`\n#${r.index}: ${r.title}`);
  console.log(`   Price: ${r.price} | Rate: ${r.rate} | Area: ${r.area} | Society: ${r.society}`);
  console.log(`   Locality: ${r.locality}`);
  console.log(`   Specs:`, JSON.stringify(r.specs));
  console.log(`   Images (${r.images.length}):`, r.images);
  console.log(`   Desc: ${r.desc.substring(0, 80)}...`);
});
