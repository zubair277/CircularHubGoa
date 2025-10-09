import { useState } from 'react';
import AuthModal from '../AuthModal';
import { Button } from '@/components/ui/button';

export default function AuthModalExample() {
  const [open, setOpen] = useState(true);

  return (
    <div className="p-8 bg-background">
      <Button onClick={() => setOpen(true)}>Open Auth Modal</Button>
      <AuthModal
        open={open}
        onOpenChange={setOpen}
        onLogin={(email, password) => console.log('Login:', { email, password })}
        onRegister={(data) => console.log('Register:', data)}
        onGoogleAuth={() => console.log('Google auth clicked')}
      />
    </div>
  );
}
