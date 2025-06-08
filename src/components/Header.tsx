
import { useState } from 'react';
import { Menu, X, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onNavigate: (sectionId: string) => void;
  onCTAClick: () => void;
  onDemoClick: () => void;
  onLoginClick?: () => void;
}

const Header = ({ onNavigate, onCTAClick, onDemoClick, onLoginClick }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: 'Como Funciona', id: 'how-it-works' },
    { label: 'Preços', id: 'pricing' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/0cf142c2-da7d-452c-a8d8-0413cfb6c023.png" 
              alt="Techcorps" 
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold text-black">Techcorps</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="text-gray-700 hover:text-black transition-colors font-medium"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={onDemoClick}
              className="text-gray-700 hover:text-black"
            >
              Demo
            </Button>
            
            {onLoginClick && (
              <Button
                variant="outline"
                onClick={onLoginClick}
                className="flex items-center space-x-2 border-gray-300"
              >
                <User className="h-4 w-4" />
                <span>Login</span>
              </Button>
            )}
            
            <Button 
              onClick={onCTAClick}
              className="bg-black hover:bg-gray-800 text-white"
            >
              <Bot className="mr-2 h-4 w-4" />
              Começar Agora
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4 pt-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMenuOpen(false);
                  }}
                  className="text-left text-gray-700 hover:text-black transition-colors font-medium"
                >
                  {item.label}
                </button>
              ))}
              
              <Button
                variant="ghost"
                onClick={() => {
                  onDemoClick();
                  setIsMenuOpen(false);
                }}
                className="justify-start text-gray-700 hover:text-black"
              >
                Demo
              </Button>
              
              {onLoginClick && (
                <Button
                  variant="outline"
                  onClick={() => {
                    onLoginClick();
                    setIsMenuOpen(false);
                  }}
                  className="justify-start flex items-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span>Login</span>
                </Button>
              )}
              
              <Button 
                onClick={() => {
                  onCTAClick();
                  setIsMenuOpen(false);
                }}
                className="bg-black hover:bg-gray-800 text-white justify-start"
              >
                <Bot className="mr-2 h-4 w-4" />
                Começar Agora
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
