/**
 * shop.js — shop details read from <body data-*> at render time.
 *
 * Kept client-side so page modules don't duplicate the strings. The
 * server stamps the attributes in index.php on first paint; this helper
 * just reads them. Any missing field falls back to a placeholder.
 */

const readAttr = (name, fallback = '') =>
  document.body.getAttribute(`data-shop-${name}`) || fallback;

export const shop = {
  name:        () => readAttr('name',       'ClipperCartel'),
  phone:       () => readAttr('phone',      ''),
  phoneTel:    () => readAttr('phone-e164', ''),
  whatsapp:    () => readAttr('whatsapp',   ''),
  address:     () => readAttr('address',    ''),
  hours:       () => readAttr('hours',      ''),
  instagram:   () => readAttr('instagram',  ''),
  tiktok:      () => readAttr('tiktok',     ''),
  maps:        () => readAttr('maps',       ''),
};

export const waLink = (text = '') => {
  const num = shop.whatsapp().replace(/\D/g, '');
  if (!num) return '#';
  const q = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${num}${q}`;
};

export const telLink = () => {
  const t = shop.phoneTel();
  return t ? `tel:${t}` : '#';
};
