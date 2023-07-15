/*
 * @Author: Songyue-yoyo songyue.zhang@student.maastrichtuniversity.nl
 * @Date: 2023-06-20 17:07:32
 * @LastEditors: Songyue-yoyo songyue.zhang@student.maastrichtuniversity.nl
 * @LastEditTime: 2023-06-25 17:13:40
 * @FilePath: /next-carousels/carousels/Bootstrap.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

//carousels/Bootstrap.js
"use client"
import { useState } from "react";
import { items } from "../public/Items.json";
import { Carousel } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "../styles/Bootstrap.module.css";
export default function BootstrapCarousel() {
  const { bootstrap } = items;
  const [index, setIndex] = useState(0);
  const handleSelect = (selectedIndex, e) => {
    setIndex(selectedIndex);
  };
  return (
    <Carousel activeIndex={index} onSelect={handleSelect} className={styles.carousel}>
      {bootstrap.map((item) => (
        <Carousel.Item key={item.id} className={styles.itemP} interval={12000}>
          <img src={item.imageUrl} alt="slides" />
          <Carousel.Caption className={styles.caption}>
            <div className={styles.captionFont}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
            <button className="btn btn-danger" onClick={publicMint}>mint</button>
          </Carousel.Caption>
        </Carousel.Item>
      ))}
    </Carousel>
  );
}
