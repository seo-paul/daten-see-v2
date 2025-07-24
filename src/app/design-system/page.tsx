'use client';

import { Button, IconButton, NavbarButton, PageButton, WidgetButton } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Logo, LogoCompact } from '@/components/brand/Logo';
import { Plus, Settings, Share, Edit, Eye, X, BarChart3, Home, User, Palette, Layers } from 'lucide-react';

/**
 * DATEN-SEE Design System v2.3 - Tailwind Arbitrary Values
 * Beige layering system with consistent gray text using direct color values
 */
export default function DesignSystemPage(): React.ReactElement {
  return (
    <div className="min-h-screen p-6 bg-[#FEFCF9]">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="relative">
          <div className="text-center py-16 rounded-3xl shadow-sm border border-[#E6D7B8] relative overflow-hidden bg-[#FDF9F3]">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-[#E6D7B8] bg-[#FBF5ED]">
                  <Palette className="w-6 h-6 text-[#3d3d3d]" />
                </div>
                <h1 className="font-display font-black text-5xl text-[#3d3d3d]">
                  DATEN-SEE
                </h1>
              </div>
              
              <h2 className="font-display text-2xl mb-4 text-[#3d3d3d]">
                Design System v2.3
              </h2>
              
              <p className="text-lg max-w-3xl mx-auto leading-relaxed mb-8 text-[#3d3d3d]">
                Stimmiges Design-System mit gestaffelten Beige-Ebenen und konsistentem Grau-Text. 
                Monochrom, harmonisch, professionell.
              </p>
              
              <div className="flex justify-center gap-4">
                <div className="px-6 py-3 rounded-xl shadow-sm border border-[#E6D7B8] bg-[#FBF5ED]">
                  <code className="text-sm font-mono text-[#3d3d3d]">Stacked Layers</code>
                </div>
                <div className="px-6 py-3 rounded-xl shadow-sm border border-[#E6D7B8] bg-[#FBF5ED]">
                  <code className="text-sm font-mono text-[#3d3d3d]">Monochrome Text</code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Logo System */}
        <div className="shadow-sm rounded-lg border border-[#E6D7B8] bg-[#F9F4EA]">
          <div className="rounded-t-lg border-b border-[#E6D7B8] p-6 bg-[#F6F0E0]">
            <h2 className="text-2xl flex items-center gap-3 text-[#3d3d3d]">
              <div className="w-6 h-6 rounded flex items-center justify-center border border-[#E6D7B8] bg-[#F3EBD6]">
                <LogoCompact size="sm" />
              </div>
              Logo System
            </h2>
            <p className="text-base mt-2 text-[#3d3d3d]">
              Professionelle Logo-Komponenten auf harmonischen Beige-Hintergründen
            </p>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Full Logo */}
              <div className="space-y-6">
                <div className="p-6 rounded-2xl border border-[#E6D7B8] bg-[#F6F0E0]">
                  <h4 className="font-semibold text-lg mb-6 text-center text-[#3d3d3d]">
                    Vollständiges Logo
                  </h4>
                  <div className="space-y-6">
                    {['sm', 'md', 'lg'].map((size) => (
                      <div 
                        key={size} 
                        className="p-6 rounded-xl border border-[#E6D7B8] flex flex-col items-center gap-3 hover:shadow-sm transition-shadow bg-[#F3EBD6]"
                      >
                        <Logo size={size as 'sm' | 'md' | 'lg'} />
                        <span className="text-xs font-medium px-3 py-1 rounded-full border border-[#E6D7B8] text-[#3d3d3d] bg-[#F0E7CC]">
                          {size.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Icon Only */}
              <div className="space-y-6">
                <div className="p-6 rounded-2xl border border-[#E6D7B8] bg-[#F6F0E0]">
                  <h4 className="font-semibold text-lg mb-6 text-center text-[#3d3d3d]">
                    Nur Icon
                  </h4>
                  <div className="space-y-6">
                    {['sm', 'md', 'lg'].map((size) => (
                      <div 
                        key={size} 
                        className="p-6 rounded-xl border border-[#E6D7B8] flex flex-col items-center gap-3 hover:shadow-sm transition-shadow bg-[#F3EBD6]"
                      >
                        <LogoCompact size={size as 'sm' | 'md' | 'lg'} />
                        <span className="text-xs font-medium px-3 py-1 rounded-full border border-[#E6D7B8] text-[#3d3d3d] bg-[#F0E7CC]">
                          {size.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Text Only */}
              <div className="space-y-6">
                <div className="p-6 rounded-2xl border border-[#E6D7B8] bg-[#F6F0E0]">
                  <h4 className="font-semibold text-lg mb-6 text-center text-[#3d3d3d]">
                    Nur Text
                  </h4>
                  <div className="space-y-6">
                    {['sm', 'md', 'lg'].map((size) => (
                      <div 
                        key={size} 
                        className="p-6 rounded-xl border border-[#E6D7B8] flex flex-col items-center gap-3 hover:shadow-sm transition-shadow bg-[#F3EBD6]"
                      >
                        <Logo variant="text" size={size as 'sm' | 'md' | 'lg'} />
                        <span className="text-xs font-medium px-3 py-1 rounded-full border border-[#E6D7B8] text-[#3d3d3d] bg-[#F0E7CC]">
                          {size.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Farbsystem */}
        <div className="shadow-sm bg-[#F9F4EA] rounded-lg border border-[#E6D7B8]">
          <div className="rounded-t-lg border-b border-[#E6D7B8] p-6 bg-[#F6F0E0]">
            <h2 className="text-2xl flex items-center gap-3 text-[#3d3d3d]">
              <Palette className="w-6 h-6" />
              Farbsystem
            </h2>
            <p className="text-base mt-2 text-[#3d3d3d]">
              Harmonisches Farbkonzept mit Beige-Layering und gezielten Blau-Akzenten
            </p>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              
              {/* Page Background (20%) */}
              <div className="text-center">
                <div className="w-20 h-20 border-2 border-[#E6D7B8] rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-sm bg-[#FEFCF9]">
                  <span className="text-lg font-bold text-[#3d3d3d]">20%</span>
                </div>
                <h4 className="font-semibold mb-2 text-[#3d3d3d]">Page Background</h4>
                <p className="text-sm text-[#3d3d3d]">20% Beige gestapelt</p>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 block">#FEFCF9</code>
              </div>

              {/* Primary Cards (40%) */}
              <div className="text-center">
                <div className="w-20 h-20 border-2 border-[#E6D7B8] rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-sm bg-[#FDF9F3]">
                  <span className="text-lg font-bold text-[#3d3d3d]">40%</span>
                </div>
                <h4 className="font-semibold mb-2 text-[#3d3d3d]">Primary Cards</h4>
                <p className="text-sm text-[#3d3d3d]">40% Beige gestapelt</p>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 block">#FDF9F3</code>
              </div>

              {/* Secondary Cards (60%) */}
              <div className="text-center">
                <div className="w-20 h-20 border-2 border-[#E6D7B8] rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-sm bg-[#FBF5ED]">
                  <span className="text-lg font-bold text-[#3d3d3d]">60%</span>
                </div>
                <h4 className="font-semibold mb-2 text-[#3d3d3d]">Secondary Cards</h4>
                <p className="text-sm text-[#3d3d3d]">60% Beige gestapelt</p>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 block">#FBF5ED</code>
              </div>

              {/* Tertiary Cards (80%) */}
              <div className="text-center">
                <div className="w-20 h-20 border-2 border-[#E6D7B8] rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-sm bg-[#F9F2E7]">
                  <span className="text-lg font-bold text-[#3d3d3d]">80%</span>
                </div>
                <h4 className="font-semibold mb-2 text-[#3d3d3d]">Tertiary Cards</h4>
                <p className="text-sm text-[#3d3d3d]">80% Beige gestapelt</p>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 block">#F9F2E7</code>
              </div>

              {/* Full Beige (100%) */}
              <div className="text-center">
                <div className="w-20 h-20 border-2 border-[#E6D7B8] rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-sm bg-[#F2E8CF]">
                  <span className="text-lg font-bold text-[#3d3d3d]">100%</span>
                </div>
                <h4 className="font-semibold mb-2 text-[#3d3d3d]">Full Beige</h4>
                <p className="text-sm text-[#3d3d3d]">Grundton</p>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 block">#F2E8CF</code>
              </div>
            </div>
            
            {/* Zusätzliche Farben */}
            <div className="mt-8 space-y-6">
              <h3 className="font-semibold text-lg text-[#3d3d3d]">Blautöne</h3>
              <div className="grid grid-cols-5 gap-4">
                
                {/* Primary Blue */}
                <div className="text-center">
                  <div className="w-20 h-20 border-2 border-[#E6D7B8] rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-sm bg-[#2F4F73]">
                    <span className="text-sm font-bold text-white">Primary</span>
                  </div>
                  <h4 className="font-semibold mb-2 text-[#3d3d3d]">Primary Blue</h4>
                  <p className="text-xs text-[#3d3d3d]">Hauptfarbe für Branding</p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 block">#2F4F73</code>
                </div>
                
                {/* Blue Shade 1 */}
                <div className="text-center">
                  <div className="w-20 h-20 border-2 border-[#E6D7B8] rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-sm bg-[#365C83]">
                    <span className="text-sm font-bold text-white">Shade 1</span>
                  </div>
                  <h4 className="font-semibold mb-2 text-[#3d3d3d]">Blue Shade 1</h4>
                  <p className="text-xs text-[#3d3d3d]">Sekundäre Aktionen</p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 block">#365C83</code>
                </div>
                
                {/* Blue Shade 2 */}
                <div className="text-center">
                  <div className="w-20 h-20 border-2 border-[#E6D7B8] rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-sm bg-[#3D6992]">
                    <span className="text-sm font-bold text-white">Shade 2</span>
                  </div>
                  <h4 className="font-semibold mb-2 text-[#3d3d3d]">Blue Shade 2</h4>
                  <p className="text-xs text-[#3d3d3d]">Tertiäre Elemente</p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 block">#3D6992</code>
                </div>
                
                {/* Blue Shade 3 */}
                <div className="text-center">
                  <div className="w-20 h-20 border-2 border-[#E6D7B8] rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-sm bg-[#4375A2]">
                    <span className="text-sm font-bold text-white">Shade 3</span>
                  </div>
                  <h4 className="font-semibold mb-2 text-[#3d3d3d]">Blue Shade 3</h4>
                  <p className="text-xs text-[#3d3d3d]">Akzente</p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 block">#4375A2</code>
                </div>
                
                {/* Blue Shade 4 */}
                <div className="text-center">
                  <div className="w-20 h-20 border-2 border-[#E6D7B8] rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-sm bg-[#4A82B1]">
                    <span className="text-sm font-bold text-white">Shade 4</span>
                  </div>
                  <h4 className="font-semibold mb-2 text-[#3d3d3d]">Blue Shade 4</h4>
                  <p className="text-xs text-[#3d3d3d]">Hellste Variante</p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 block">#4A82B1</code>
                </div>
              </div>
              
              <h3 className="font-semibold text-lg text-[#3d3d3d]">Grau & Weiß</h3>
              <div className="grid grid-cols-2 gap-4 max-w-md">
                
                {/* Textgrau */}
                <div className="text-center">
                  <div className="w-20 h-20 border-2 border-[#E6D7B8] rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-sm bg-[#3d3d3d]">
                    <span className="text-lg font-bold text-white">800</span>
                  </div>
                  <h4 className="font-semibold mb-2 text-[#3d3d3d]">Textgrau</h4>
                  <p className="text-sm text-[#3d3d3d]">Konsistenter Text</p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 block">#3d3d3d</code>
                </div>
                
                {/* Weiß */}
                <div className="text-center">
                  <div className="w-20 h-20 border-2 border-[#E6D7B8] rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-sm bg-white">
                    <span className="text-lg font-bold text-[#3d3d3d]">0</span>
                  </div>
                  <h4 className="font-semibold mb-2 text-[#3d3d3d]">Weiß</h4>
                  <p className="text-sm text-[#3d3d3d]">Button-Text, Icons</p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 block">#FFFFFF</code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Typography System */}
        <div className="shadow-sm rounded-lg border border-[#E6D7B8] bg-[#F9F4EA]">
          <div className="rounded-t-lg border-b border-[#E6D7B8] p-6 bg-[#F6F0E0]">
            <h2 className="text-2xl flex items-center gap-3 text-[#3d3d3d]">
              <div className="w-6 h-6 bg-[#2F4F73] rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">Aa</span>
              </div>
              Typography System
            </h2>
            <p className="text-base mt-2 text-[#3d3d3d]">
              Custom Fonts für Markenidentität und optimale Lesbarkeit
            </p>
          </div>
          <div className="p-8 space-y-8">
            
            {/* Font Families */}
            <div className="space-y-6">
              <h3 className="font-semibold text-lg text-[#3d3d3d]">Font-Familien</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Display Font */}
                <div className="p-6 rounded-xl border border-[#E6D7B8] bg-[#F6F0E0]">
                  <h4 className="font-semibold mb-4 text-[#3d3d3d]">Fjalla One (Display)</h4>
                  <div className="space-y-3">
                    <div className="font-display text-4xl text-[#3d3d3d]">DATEN-SEE</div>
                    <div className="font-display text-2xl text-[#3d3d3d]">Headlines</div>
                    <div className="font-display text-lg text-[#3d3d3d]">Subheadings</div>
                  </div>
                  <p className="text-sm mt-4 text-[#3d3d3d]/70">Für Überschriften und Marken-Elemente</p>
                </div>
                
                {/* Body Font */}
                <div className="p-6 rounded-xl border border-[#E6D7B8] bg-[#F6F0E0]">
                  <h4 className="font-semibold mb-4 text-[#3d3d3d]">Poppins (Body)</h4>
                  <div className="space-y-3">
                    <div className="font-body text-xl font-semibold text-[#3d3d3d]">Semibold Text</div>
                    <div className="font-body text-base text-[#3d3d3d]">Regular paragraph text with good readability and clean appearance.</div>
                    <div className="font-body text-sm text-[#3d3d3d]">Small text details</div>
                  </div>
                  <p className="text-sm mt-4 text-[#3d3d3d]/70">Für Fließtext und UI-Elemente</p>
                </div>
                
                {/* Accent Font */}
                <div className="p-6 rounded-xl border border-[#E6D7B8] bg-[#F6F0E0]">
                  <h4 className="font-semibold mb-4 text-[#3d3d3d]">Barlow (Accent)</h4>
                  <div className="space-y-3">
                    <div className="font-accent text-lg font-semibold text-[#3d3d3d]">Navigation Items</div>
                    <div className="font-accent text-base text-[#3d3d3d]">Button labels and UI text</div>
                    <div className="font-accent text-sm text-[#3d3d3d]">Form labels</div>
                  </div>
                  <p className="text-sm mt-4 text-[#3d3d3d]/70">Für UI-Komponenten und Navigation</p>
                </div>
              </div>
            </div>
            
            {/* Font Sizes */}
            <div className="space-y-6">
              <h3 className="font-semibold text-lg text-[#3d3d3d]">Text-Größen & Hierarchie</h3>
              <div className="p-6 rounded-xl border border-[#E6D7B8] bg-[#F6F0E0] space-y-4">
                <div className="font-display text-6xl text-[#3d3d3d]">6XL Display</div>
                <div className="font-display text-5xl text-[#3d3d3d]">5XL Headline</div>
                <div className="font-display text-4xl text-[#3d3d3d]">4XL Heading</div>
                <div className="font-body text-3xl text-[#3d3d3d]">3XL Subheading</div>
                <div className="font-body text-2xl text-[#3d3d3d]">2XL Section Title</div>
                <div className="font-body text-xl text-[#3d3d3d]">XL Large Text</div>
                <div className="font-body text-lg text-[#3d3d3d]">LG Body Large</div>
                <div className="font-body text-base text-[#3d3d3d]">Base Regular Text (16px)</div>
                <div className="font-body text-sm text-[#3d3d3d]">SM Small Text (14px)</div>
                <div className="font-body text-xs text-[#3d3d3d]">XS Caption Text (12px)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Button System */}
        <div className="shadow-sm rounded-lg border border-[#E6D7B8] bg-[#F9F4EA]">
          <div className="rounded-t-lg border-b border-[#E6D7B8] p-6 bg-[#F6F0E0]">
            <h2 className="text-2xl flex items-center gap-3 text-[#3d3d3d]">
              <div className="w-6 h-6 bg-[#2F4F73] rounded flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded"></div>
              </div>
              Button-System
            </h2>
            <p className="text-base mt-2 text-[#3d3d3d]">
              Buttons mit pressed-shadow Effekt auf harmonischen Beige-Ebenen
            </p>
          </div>
          <div className="p-8 space-y-10">
            
            {/* Primary Buttons */}
            <div className="p-8 rounded-2xl border border-[#E6D7B8] bg-[#F6F0E0]">
              <h3 className="font-semibold text-xl mb-2 flex items-center gap-2 text-[#3d3d3d]">
                <div className="w-2 h-2 bg-[#2F4F73] rounded-full"></div>
                Haupt-Buttons (Primary)
              </h3>
              <p className="mb-6 text-[#3d3d3d]">
                Beige Hintergrund mit dunkelblauem Text und Border
              </p>
              
              <div className="space-y-8">
                <div className="space-y-4">
                  <h4 className="font-medium text-[#3d3d3d]">Navbar Buttons (2px/3px Shadow)</h4>
                  <div className="p-6 rounded-xl border border-[#E6D7B8] bg-[#F3EBD6]">
                    <div className="flex flex-wrap gap-3">
                      <NavbarButton leftIcon={<Home className="w-4 h-4" />}>Home</NavbarButton>
                      <NavbarButton leftIcon={<BarChart3 className="w-4 h-4" />}>Dashboards</NavbarButton>
                      <NavbarButton leftIcon={<User className="w-4 h-4" />}>Community</NavbarButton>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-[#3d3d3d]">Onpage Buttons (3px/5px Shadow)</h4>
                  <div className="p-6 rounded-xl border border-[#E6D7B8] bg-[#F3EBD6]">
                    <div className="flex flex-wrap gap-3">
                      <Button variant="primary" context="page" leftIcon={<Plus className="w-4 h-4" />}>Erstellen</Button>
                      <Button variant="primary" context="page" leftIcon={<Edit className="w-4 h-4" />}>Bearbeiten</Button>
                      <Button variant="primary" context="page" leftIcon={<Settings className="w-4 h-4" />}>Einstellungen</Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-[#3d3d3d]">Interactive States</h4>
                  <div className="p-6 rounded-xl border border-[#E6D7B8] bg-[#F3EBD6]">
                    <div className="flex gap-3">
                      <Button variant="primary">Normal State</Button>
                      <Button variant="primary" loading>Loading State</Button>
                      <Button variant="primary" disabled>Disabled State</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Buttons */}
            <div className="p-8 rounded-2xl border border-[#E6D7B8] bg-[#F6F0E0]">
              <h3 className="font-semibold text-xl mb-2 flex items-center gap-2 text-[#3d3d3d]">
                <div className="w-2 h-2 bg-[#6B9AC4] rounded-full"></div>
                Sekundäre Buttons (Secondary)
              </h3>
              <p className="mb-6 text-[#3d3d3d]">
                Hellblaue Buttons mit weißer Schrift für spezielle Aktionen (3px/5px shadow)
              </p>
              
              <div className="p-6 rounded-xl border border-[#E6D7B8] bg-[#F3EBD6]">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Button variant="secondary" context="page" leftIcon={<Plus className="w-4 h-4" />}>Widget hinzufügen</Button>
                  <Button variant="secondary" context="page" leftIcon={<Edit className="w-4 h-4" />}>Bearbeiten</Button>
                  <Button variant="secondary" context="page" leftIcon={<Eye className="w-4 h-4" />}>Ansicht</Button>
                  <Button variant="secondary" context="page" leftIcon={<Share className="w-4 h-4" />}>Exportieren</Button>
                </div>
                
                <div className="flex flex-wrap gap-3 pt-4 border-t border-[#E6D7B8]">
                  <Button variant="secondary" context="page" size="sm">Edit</Button>
                  <Button variant="secondary" context="page" size="sm">Delete</Button>
                  <IconButton 
                    context="page"
                    variant="secondary"
                    size="sm"
                    icon={<X className="w-3 h-3" />}
                    aria-label="Close"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8 rounded-2xl border border-[#E6D7B8] shadow-sm bg-[#F9F4EA]">
          <div className="flex items-center justify-center gap-2 mb-2">
            <LogoCompact size="sm" />
            <span className="font-semibold text-[#3d3d3d]">
              DATEN-SEE Design System v2.3
            </span>
          </div>
          <p className="text-sm text-[#3d3d3d]">
            Stimmig, monochrom, harmonisch
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <span className="text-xs px-3 py-1 rounded-full border border-[#E6D7B8] text-[#3d3d3d] bg-[#F6F0E0]">
              Stacked Layers
            </span>
            <span className="text-xs px-3 py-1 rounded-full border border-[#E6D7B8] text-[#3d3d3d] bg-[#F6F0E0]">
              Monochrome Text
            </span>
            <span className="text-xs px-3 py-1 rounded-full border border-[#E6D7B8] text-[#3d3d3d] bg-[#F6F0E0]">
              Blue Accents Only
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}