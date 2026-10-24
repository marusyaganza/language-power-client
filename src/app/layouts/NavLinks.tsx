import { NavLink } from "react-router-dom";
import { paths } from "@/shared/paths";
import classes from "./Header.module.css";

const NAV_LINKS = [
  { to: paths.search, label: "Search" },
  { to: paths.vocabulary, label: "Vocabulary" },
  { to: paths.games, label: "Games" },
];

interface NavLinksProps {
  /** Called when a link is clicked, e.g. to close the phone menu. */
  onNavigate?: () => void;
  /** Extra class for each link, e.g. bigger tap targets in the phone menu. */
  linkClassName?: string;
}

/** The app's main pages. The caller supplies the `nav` element and its layout. */
export function NavLinks({ onNavigate, linkClassName }: NavLinksProps) {
  return NAV_LINKS.map(({ to, label }) => (
    <NavLink
      key={to}
      to={to}
      onClick={onNavigate}
      className={linkClassName ? `${classes.link} ${linkClassName}` : classes.link}
    >
      {label}
    </NavLink>
  ));
}
