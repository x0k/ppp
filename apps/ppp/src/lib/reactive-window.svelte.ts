class ReactiveWindow implements Disposable {
  innerWidth = $state(window.innerWidth);
  innerHeight = $state(window.innerHeight);

  constructor() {
    window.addEventListener("resize", this.onResize);
  }

  [Symbol.dispose]() {
    window.removeEventListener("resize", this.onResize);
  }

  private onResize = () => {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
  };
}

export const reactiveWindow = new ReactiveWindow()
