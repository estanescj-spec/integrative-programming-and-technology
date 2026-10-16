import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function StoreLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
