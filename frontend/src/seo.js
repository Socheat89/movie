export function updateSeo({ title, description, keywords, image, url, schema }) {
  if (title) {
    document.title = title;
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);
  }
  
  if (description) {
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', description);
    
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);
  }
  
  if (keywords) {
    const metaKeys = document.querySelector('meta[name="keywords"]');
    if (metaKeys) metaKeys.setAttribute('content', keywords);
  }
  
  if (image) {
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.setAttribute('content', image);
  }
  
  if (url) {
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', url);
    
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
  }

  // Handle JSON-LD Structured Data
  let scriptTag = document.getElementById('jsonld-seo');
  if (scriptTag) {
    scriptTag.remove();
  }

  if (schema) {
    scriptTag = document.createElement('script');
    scriptTag.id = 'jsonld-seo';
    scriptTag.type = 'application/ld+json';
    scriptTag.innerHTML = JSON.stringify(schema);
    document.head.appendChild(scriptTag);
  }
}
