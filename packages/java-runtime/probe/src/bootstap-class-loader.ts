import Doppio from 'doppiojvm'

export function makeBootstrapClassLoaderFactory(
  cache: Map<string, Doppio.VM.ClassFile.BootstrapClassLoader>
) {
  return (
    javaHome: string,
    classPaths: string[],
    next: (err?: any) => void
  ) => {
    const key = `${javaHome}:${classPaths.join(";")}`;
    const cached = cache.get(key);
    if (cached !== undefined) {
      console.log("Using cached bootstrap class loader");
      setTimeout(next, 0);
      return cached;
    }
    if (cache.size > 0) {
      cache.clear();
    }
    const bootstrapClassLoader = new Doppio.VM.ClassFile.BootstrapClassLoader(
      javaHome,
      classPaths,
      next
    );
    cache.set(key, bootstrapClassLoader);
    return bootstrapClassLoader;
  };
}
