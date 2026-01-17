import { baseURL } from "@/baseUrl";
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { get_cinematic_itinerary, TravelInputSchema } from "@/server/tools/travel_planner";

const getAppsSdkCompatibleHtml = async (baseUrl: string, path: string) => {
  const result = await fetch(`${baseUrl}${path}`);
  return await result.text();
};

type ContentWidget = {
  id: string;
  title: string;
  templateUri: string;
  invoking: string;
  invoked: string;
  html: string;
  description: string;
  widgetDomain: string;
};

function widgetMeta(widget: ContentWidget) {
  return {
    "openai/outputTemplate": widget.templateUri,
    "openai/toolInvocation/invoking": widget.invoking,
    "openai/toolInvocation/invoked": widget.invoked,
    "openai/widgetAccessible": false,
    "openai/resultCanProduceWidget": true,
  } as const;
}

const handler = createMcpHandler(async (server) => {
  const html = await getAppsSdkCompatibleHtml(baseURL, "/");
  const itineraryHtml = await getAppsSdkCompatibleHtml(baseURL, "/widget/itinerary");

  const contentWidget: ContentWidget = {
    id: "show_content",
    title: "Show Content",
    templateUri: "ui://widget/content-template.html",
    invoking: "Loading content...",
    invoked: "Content loaded",
    html: html,
    description: "Displays the homepage content",
    widgetDomain: "https://nextjs.org/docs", // Keeping original domain for existing widget
  };

  const itineraryWidget: ContentWidget = {
    id: "cinematic_itinerary_widget",
    title: "Cinematic Itinerary",
    templateUri: "ui://widget/itinerary.html",
    invoking: "Planning trip...",
    invoked: "Trip planned",
    html: itineraryHtml,
    description: "Displays a cinematic travel itinerary",
    widgetDomain: "https://chatgpt.com", // Or appropriate domain
  };

  server.registerResource(
    "content-widget",
    contentWidget.templateUri,
    {
      title: contentWidget.title,
      description: contentWidget.description,
      mimeType: "text/html+skybridge",
      _meta: {
        "openai/widgetDescription": contentWidget.description,
        "openai/widgetPrefersBorder": true,
      },
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/html+skybridge",
          text: `<html>${contentWidget.html}</html>`,
          _meta: {
            "openai/widgetDescription": contentWidget.description,
            "openai/widgetPrefersBorder": true,
            "openai/widgetDomain": contentWidget.widgetDomain,
          },
        },
      ],
    })
  );

  server.registerResource(
    "itinerary-widget",
    itineraryWidget.templateUri,
    {
      title: itineraryWidget.title,
      description: itineraryWidget.description,
      mimeType: "text/html+skybridge",
      _meta: {
        "openai/widgetDescription": itineraryWidget.description,
        "openai/widgetPrefersBorder": true,
      },
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/html+skybridge",
          text: `<html>${itineraryWidget.html}</html>`,
          _meta: {
            "openai/widgetDescription": itineraryWidget.description,
            "openai/widgetPrefersBorder": true,
            "openai/widgetDomain": itineraryWidget.widgetDomain,
          },
        },
      ],
    })
  );

  server.registerTool(
    contentWidget.id,
    {
      title: contentWidget.title,
      description:
        "Fetch and display the homepage content with the name of the user",
      inputSchema: {
        name: z.string().describe("The name of the user to display on the homepage"),
      },
      _meta: widgetMeta(contentWidget),
    },
    async ({ name }) => {
      return {
        content: [
          {
            type: "text",
            text: name,
          },
        ],
        structuredContent: {
          name: name,
          timestamp: new Date().toISOString(),
        },
        _meta: widgetMeta(contentWidget),
      };
    }
  );

  server.registerTool(
    "get_cinematic_itinerary",
    {
      title: itineraryWidget.title,
      description: "Generate a cinematic travel itinerary based on location and vibe (e.g., Wes Anderson, Cyberpunk)",
      inputSchema: TravelInputSchema.shape,
      _meta: widgetMeta(itineraryWidget),
    },
    async (inputs) => {
      const result = await get_cinematic_itinerary(inputs.location, inputs.vibe);
      return {
        content: [
          {
            type: "text",
            text: `Here is a ${inputs.vibe} itinerary for ${inputs.location}.`,
          }
        ],
        structuredContent: result as any,
        _meta: widgetMeta(itineraryWidget),
      };
    }
  );
});

export const GET = handler;
export const POST = handler;
