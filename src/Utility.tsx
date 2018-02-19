export function mapGetOrDie<K, V>(key: K, map: Map<K, V>): V {
  let o = map.get(key);
  if (o) {
    return o;
  }
  throw new Error(`Key ${key} does not exist in map.`);
}