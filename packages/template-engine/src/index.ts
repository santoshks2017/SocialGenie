export interface Template {
  id: string;
  layout: {
    logoPosition: string;
    carImagePosition: string;
    offerBadgePosition: string;
  };
}

export const festivalOfferTemplate: Template = {
  id: 'festival_offer',
  layout: {
    logoPosition: 'top-left',
    carImagePosition: 'center',
    offerBadgePosition: 'top-right'
  }
};

export const discountOfferTemplate: Template = {
  id: 'discount_offer',
  layout: {
    logoPosition: 'top-center',
    carImagePosition: 'bottom-center',
    offerBadgePosition: 'center'
  }
};

export const minimalCleanTemplate: Template = {
  id: 'minimal_clean',
  layout: {
    logoPosition: 'bottom-right',
    carImagePosition: 'center',
    offerBadgePosition: 'none'
  }
};

export const defaultTemplates: Record<string, Template> = {
  festival_offer: festivalOfferTemplate,
  discount_offer: discountOfferTemplate,
  minimal_clean: minimalCleanTemplate
};

export interface RecommendTemplateInput {
  festival?: string;
}

export function recommendTemplate(input: RecommendTemplateInput): Template {
  if (input.festival && input.festival.trim().length > 0) {
    return festivalOfferTemplate;
  }
  
  return minimalCleanTemplate;
}
