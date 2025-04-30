import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom';
import 'antd/dist/reset.css'; // Ant Design (v5+)
import './index.css'; // Tailwind
import { router } from './router/index.tsx';
import Loading from './components/Loading.tsx';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
     <Suspense fallback={<Loading />}>
      <RouterProvider router={router} />
    </Suspense>
  </StrictMode>,
)
