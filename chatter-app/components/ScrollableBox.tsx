import React, { useEffect, useRef } from "react";

export default function ScrollableBox({
  children,
  classname,
}: {
  children: React.ReactNode;
  classname: string;
}) {
  const container = useRef<HTMLDivElement>(null);

  const Scroll = () => {
    const { offsetHeight, scrollHeight, scrollTop } =
      container.current as HTMLDivElement;
    if (scrollHeight <= scrollTop + offsetHeight + 100) {
      container.current?.scrollTo(0, scrollHeight);
    }
  };

  useEffect(() => {
    Scroll();
  }, [children]);

  return <div ref={container} className={classname}><div className="flex shrink grow" />{children}</div>;
}
