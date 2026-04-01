import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles/globals.css";
import { Layout } from "./components/Layout";
import { FormLayout } from "./components/form/FormLayout";
import { Home } from "./pages/Home";
import { Requests } from "./pages/Requests";
import { Analytics } from "./pages/Analytics";
import { Settings } from "./pages/Settings";
import { FormLanding } from "./pages/form/FormLanding";
import { GuidedForm } from "./pages/form/GuidedForm";
import { UploadForm } from "./pages/form/UploadForm";
import { PasteForm } from "./pages/form/PasteForm";
import { ChatForm } from "./pages/form/ChatForm";
import { ConfirmationPage } from "./pages/form/ConfirmationPage";
import { SuccessPage } from "./pages/form/SuccessPage";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Admin routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Public form routes */}
        <Route element={<FormLayout />}>
          <Route path="/form" element={<FormLanding />} />
          <Route path="/form/guided" element={<GuidedForm />} />
          <Route path="/form/upload" element={<UploadForm />} />
          <Route path="/form/paste" element={<PasteForm />} />
          <Route path="/form/chat" element={<ChatForm />} />
          <Route path="/form/confirm" element={<ConfirmationPage />} />
          <Route path="/form/success" element={<SuccessPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
