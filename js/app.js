import "./bootstrap";
import focus from "@alpinejs/focus";
import collapse from "@alpinejs/collapse";
import Alpine from "alpinejs";
import "./animations/sidebarAnimation";
import "./manager/summary";
import './manager/chart'

Alpine.plugin(focus);
Alpine.plugin(collapse);

window.Alpine = Alpine;

Alpine.start();
