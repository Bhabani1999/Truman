const dotenv = require('dotenv').config();
const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_KEY });

const retrievePageData = async (pageId) => {
  try {
    const page = await notion.pages.retrieve({ page_id: pageId });
    const pageProperties = {
      id: page.id,
      pageTitle: page.properties["Name"]?.title[0]?.plain_text || "",
      pageDescription: page.properties["Description"]?.rich_text[0]?.plain_text || "",
      icon: page.icon?.emoji || "",
      creationDate: page.created_time,
      Tags: page.properties["Tags"]?.select.name || "", // Assuming "Tags" is a select property
    };

    const blockResponse = await notion.blocks.children.list({ block_id: pageId });
    // Initialize an array to store all content (including images, lists, H2 text, etc.)
    const content = [];

    const processBlock = async (block) => {
      switch (block.type) {
        case 'image':
          // Handle images
          const imageUrl = block.image.external.url;
          content.push({ type: 'image', url: imageUrl });
          break;
        case 'heading_2':
          // Handle H2 text
          const h2Content = block.heading_2.rich_text[0]?.text?.content || "";
          content.push({ type: 'h2', text: h2Content });
          break;
        case 'toggle':
          // Handle toggle blocks
          const toggleContent = block.toggle.rich_text[0]?.text?.content || "";
          content.push({ type: 'toggle', text: toggleContent });
          break;
        case 'bulleted_list_item':
          // Handle bulleted lists
          const bulletContent = block.bulleted_list_item.rich_text[0]?.text?.content || "";
          content.push({ type: 'bullet', text: bulletContent });
          break;
        case 'numbered_list_item':
          // Handle numbered lists
          const numberedContent = block.numbered_list_item.rich_text[0]?.text?.content || "";
          content.push({ type: 'numbered', text: numberedContent });

          // Check for nested blocks (if iterable)
          if (block.children && typeof block.children[Symbol.iterator] === 'function') {
            for (const childBlock of block.children) {
              await processBlock(childBlock);
            }
          }
          break;
        case 'paragraph':
          // Handle paragraphs
          if (block.paragraph && block.paragraph.rich_text) {
            const paragraphContent = block.paragraph.rich_text.map((richText) => {
              return richText.text.content;
            }).join(" "); // Combine text content within the paragraph

            content.push({ type: 'text', text: paragraphContent });
          }
          break;
        default:
          content.push({ type: 'text', text: "Unsupported block type" });
          break;
      }
    };

    for (const block of blockResponse.results) {
      await processBlock(block);
    }

    return {
      properties: pageProperties,
      content: content,
    };
  } catch (error) {
    console.error("Error retrieving page data:", error);
    throw error;
  }
};

module.exports = retrievePageData;
