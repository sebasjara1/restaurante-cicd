// Autenticación simple por token en la cabecera Authorization: Bearer <token>.
export function requiereToken(token) {
  return (req, res, next) => {
    if (req.get('authorization') !== `Bearer ${token}`) {
      return res.status(401).json({ error: 'Token inválido o ausente' });
    }
    next();
  };
}
