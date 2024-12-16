export function getServerUrl(req) {
  return `${req.protocol}://${req.get('Host')}${req.originalUrl}`;
}
