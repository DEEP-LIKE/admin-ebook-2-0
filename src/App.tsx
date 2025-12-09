import { Refine } from "@refinedev/core";
import { Login } from "./pages/login";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import {
  ErrorComponent,
  ThemedLayout,
  ThemedSider,
  useNotificationProvider,
  AuthPage,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import routerProvider, {
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { ConfigProvider, App as AntdApp } from "antd";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import { Header } from "./components/header";
import { AppTitle } from "./components/app-title";
import { ColorModeContextProvider } from "./contexts/color-mode";

// Custom Providers
import { authProvider } from "./providers/authProvider";
import { dataProvider } from "./providers/dataProvider";

// Ford Theme
import { fordTheme } from "./theme";

// Ford Resources
import {
  SiteList,
  SiteEdit,
  SiteCreate,
  SiteShow,
} from "./pages/sites";
import {
  ImageList,
  ImageCreate,
  ImageShow,
} from "./pages/images";
import {
  CarList,
  CarEdit,
  CarCreate,
  CarShow,
} from "./pages/cars";
import {
  ContactMailList,
  ContactMailEdit,
  ContactMailCreate,
  ContactMailShow,
} from "./pages/contact_mails";
import {
  PromotionList,
  PromotionEdit,
  PromotionCreate,
  PromotionShow,
} from "./pages/promotions";

import {
  GlobalOutlined,
  FileImageOutlined,
  CarOutlined,
  MailOutlined,
  GiftOutlined,
} from "@ant-design/icons";

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AntdApp>
              <DevtoolsProvider>
                <Refine
                  authProvider={authProvider}
                  notificationProvider={useNotificationProvider}
                  routerProvider={routerProvider}
                  dataProvider={dataProvider}
                  resources={[
                    {
                      name: "sites",
                      list: "/sites",
                      create: "/sites/create",
                      edit: "/sites/edit/:id",
                      show: "/sites/show/:id",
                      meta: {
                        canDelete: true,
                        icon: <GlobalOutlined />,
                        label: "Sites",
                      },
                    },
                    {
                      name: "images",
                      list: "/images",
                      create: "/images/create",
                      show: "/images/show/:id",
                      meta: {
                        canDelete: true,
                        icon: <FileImageOutlined />,
                        label: "Images",
                      },
                    },
                    {
                      name: "cars",
                      list: "/cars",
                      create: "/cars/create",
                      edit: "/cars/edit/:id",
                      show: "/cars/show/:id",
                      meta: {
                        canDelete: true,
                        icon: <CarOutlined />,
                        label: "Cars",
                      },
                    },
                    {
                      name: "contact_mails",
                      list: "/contact_mails",
                      create: "/contact_mails/create",
                      edit: "/contact_mails/edit/:id",
                      show: "/contact_mails/show/:id",
                      meta: {
                        canDelete: true,
                        icon: <MailOutlined />,
                        label: "Contact Mails",
                      },
                    },
                    {
                      name: "promotions",
                      list: "/promotions",
                      create: "/promotions/create",
                      edit: "/promotions/edit/:id",
                      show: "/promotions/show/:id",
                      meta: {
                        canDelete: true,
                        icon: <GiftOutlined />,
                        label: "Promotions",
                      },
                    },

                  ]}
                  options={{
                    syncWithLocation: true,
                    warnWhenUnsavedChanges: true,
                    projectId: "KVbPVR-VqxjeK-1MLytf",
                    title: { text: "Ebook Ford" },
                  }}
                >
                  <Routes>
                    <Route
                      element={<Login />}
                      path="/login"
                    />
                    <Route
                      element={
                        <ThemedLayout
                          Header={() => <Header sticky />}
                          Sider={(props) => <ThemedSider {...props} fixed Title={AppTitle} />}
                        >
                          <Outlet />
                        </ThemedLayout>
                      }
                    >
                      <Route
                        index
                        element={<NavigateToResource resource="sites" />}
                      />
                      
                      {/* Ford Resources */}
                      <Route path="/sites">
                        <Route index element={<SiteList />} />
                        <Route path="create" element={<SiteCreate />} />
                        <Route path="edit/:id" element={<SiteEdit />} />
                        <Route path="show/:id" element={<SiteShow />} />
                      </Route>
                      
                      <Route path="/images">
                        <Route index element={<ImageList />} />
                        <Route path="create" element={<ImageCreate />} />
                        <Route path="show/:id" element={<ImageShow />} />
                      </Route>
                      
                      <Route path="/cars">
                        <Route index element={<CarList />} />
                        <Route path="create" element={<CarCreate />} />
                        <Route path="edit/:id" element={<CarEdit />} />
                        <Route path="show/:id" element={<CarShow />} />
                      </Route>
                      
                      <Route path="/contact_mails">
                        <Route index element={<ContactMailList />} />
                        <Route path="create" element={<ContactMailCreate />} />
                        <Route path="edit/:id" element={<ContactMailEdit />} />
                        <Route path="show/:id" element={<ContactMailShow />} />
                      </Route>
                      
                      <Route path="/promotions">
                        <Route index element={<PromotionList />} />
                        <Route path="create" element={<PromotionCreate />} />
                        <Route path="edit/:id" element={<PromotionEdit />} />
                        <Route path="show/:id" element={<PromotionShow />} />
                      </Route>
                      <Route path="*" element={<ErrorComponent />} />
                    </Route>
                  </Routes>

                  <RefineKbar />
                  <UnsavedChangesNotifier />
                  <DocumentTitleHandler 
                      handler={({ resource, action, pathname = '' }) => {
                        if (resource && action) {
                          const actionLabel = action.charAt(0).toUpperCase() + action.slice(1);
                          return `${actionLabel} ${resource.name} | Ebook Ford`;
                        }
                        
                        // Handle list views
                        const resourceFromPath = pathname.split('/')[1];
                        if (resourceFromPath) {
                          const resourceName = resourceFromPath
                            .split('_')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ');
                          return `[${resourceName}] | Ebook Ford`;
                        }
                        
                        return 'Ebook Ford';
                      }}
                    />
                </Refine>
                <DevtoolsPanel />
              </DevtoolsProvider>
            </AntdApp>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
