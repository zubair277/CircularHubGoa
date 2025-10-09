import Navbar from '../Navbar';

export default function NavbarExample() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar
        isAuthenticated={true}
        userName="Green Resort Goa"
        onAuthClick={() => console.log('Auth clicked')}
        onLogout={() => console.log('Logout clicked')}
      />
      <div className="p-8">
        <h1 className="text-2xl font-semibold">Navbar Component Preview</h1>
        <p className="text-muted-foreground mt-2">The navbar is sticky and includes navigation links and user menu.</p>
      </div>
    </div>
  );
}
