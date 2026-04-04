import { gsap } from 'gsap'

let isOpen = false;
let timeline = null;

function initSidebar() {
   const sidebarContent = document.querySelector('[data-sidebar-content]');
   const sidebarOverlay = document.querySelector('[data-sidebar-overlay]');

   timeline = gsap.timeline({ paused: true });

   timeline.fromTo(sidebarContent,
      { xPercent: -100 },
      { xPercent: 0, duration: 0.4, ease: "power2.out" }
   )
   .fromTo(sidebarOverlay,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.4 },
   "<");

   sidebarOverlay.addEventListener('click', toggle);
   sidebarOverlay.addEventListener('mouseenter', toggle);
}

export function toggle() {
   if (!isOpen) {
      timeline.play();
   } else {
      timeline.reverse();
   }
   isOpen = !isOpen;
}

document.addEventListener('DOMContentLoaded', () => {
   if(!document.querySelector('[data-sidebar]')) {
      return
   }

   initSidebar();
   document.querySelectorAll('[data-sidebar-toggle]').forEach(btn => {
      btn.addEventListener('click', toggle);
   });
});